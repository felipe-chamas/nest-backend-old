import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AccountId, AssetId, ChainId } from 'caip'

import { NftDto } from '@common/dto/nft.dto'
import { Nft } from '@common/types/nft'
import {
  ExternalApiNft,
  QuickNodeFetchNftsResponse,
  QuickNodeGetTransactionResponse,
  SolscanTokenAccountResponse
} from '@common/types/quicknode'

import { HttpQuicknodeApiService } from './quicknode/api.service'

import type { AssetIdDto } from '@common/types/caip'

@Injectable()
export class SolanaService {
  constructor(
    private readonly config: ConfigService,
    private readonly quicknodeService: HttpQuicknodeApiService,
    private readonly httpService: HttpService
  ) {
    this.quicknodeService.axiosRef.defaults.baseURL = this.config.get('quicknode.quicknode_uri')

    this.httpService.axiosRef.defaults.baseURL =
      this.config.get('stage') === 'production'
        ? 'https://public-api.solscan.io'
        : 'https://public-api-test.solscan.io'
  }

  async getNft(assetId: AssetId): Promise<NftDto> {
    const { data: nft, status } = await this.httpService.axiosRef.get<SolscanTokenAccountResponse>(
      `account/${assetId.tokenId}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (status !== 200) throw new BadRequestException()
    return {
      assetId,
      tokenUri: nft.metadata.data.uri,
      metadata: nft.metadata.data
    }
  }

  async getAccountNfts(accountId: AccountId): Promise<NftDto[]> {
    const nfts: Nft[][] = []
    const { data, status } = await this.quicknodeService.axiosRef.post<QuickNodeFetchNftsResponse>(
      '',
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'qn_fetchNFTs',
        params: {
          wallet: accountId.address,
          omitFields: ['provenance', 'creators'],
          page: 1,
          perPage: 40
        }
      }
    )

    if (!data) throw new NotFoundException(`Wallet not found: ${accountId.address}`)
    if (status !== 200) throw new BadRequestException()

    const {
      result: { totalPages, assets }
    } = data

    nfts.push(assets.map((nft) => this.formatNft(accountId.chainId, nft)))

    await Promise.all(
      Array(totalPages).map(async (_, i) => {
        if (i === 0) return
        const {
          data: { result }
        } = await this.quicknodeService.axiosRef.post<QuickNodeFetchNftsResponse>('', {
          jsonrpc: '2.0',
          id: 1,
          method: 'qn_fetchNFTs',
          params: {
            wallet: accountId.address,
            omitFields: ['provenance', 'creators'],
            page: i + 1,
            perPage: 40
          }
        })
        nfts.push(result.assets.map((nft) => this.formatNft(accountId.chainId, nft)))
      })
    )

    return nfts.flat()
  }

  formatNft(chainId: ChainId, nft: ExternalApiNft) {
    const assetId = new AssetId({
      chainId,
      assetName: {
        namespace: 'NonFungible',
        reference: nft.collectionAddress
      },
      tokenId: nft.tokenAddress
    })

    return {
      assetId: assetId.toJSON() as AssetIdDto,
      tokenUri: '',
      symbol: '',
      metadata: {
        name: nft.name,
        description: nft.description,
        image: nft.imageUrl,
        attributes: nft.traits
      }
    }
  }

  async getNftTransaction(
    chainId: ChainId,
    transactionHash: string
  ): Promise<{
    from: AccountId
    to: AccountId
    nft: NftDto
  }> {
    const { data, status } =
      await this.quicknodeService.axiosRef.post<QuickNodeGetTransactionResponse>('', {
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [transactionHash, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
      })

    if (!data || !data.result || status !== 200)
      throw new NotFoundException(`Transaction not found: ${transactionHash}`)

    const tx = data.result.meta
    const from = tx.preTokenBalances[0].owner
    const to = tx.postTokenBalances.find(({ owner }) => owner !== from)?.owner
    const tokenAddress = tx.preTokenBalances[0].mint

    const nfts = await this.getAccountNfts(new AccountId({ chainId, address: to }))
    const nft = nfts.find((nft) => nft.assetId.tokenId === tokenAddress)

    if (!nft) throw new NotFoundException(`NFT ${tokenAddress} not found on bridge ${to}`)

    return {
      from: new AccountId({ chainId, address: from }),
      to: new AccountId({ chainId, address: to }),
      nft
    }
  }
}
