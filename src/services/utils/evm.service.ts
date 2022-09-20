import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AccountId, AssetId, ChainId } from 'caip'
import { ethers } from 'ethers'

import { NftDto } from '@common/dto/nft.dto'
import { logger } from '@common/providers/logger'
import {
  MoralisResponseNftsByAddress,
  MoralisResponseSearchNft,
  MoralisResultNftsByAddress
} from '@common/types/moralis'

import { HttpMoralisApiService } from './moralis/api.service'

import type { AssetIdDto } from '@common/types/caip'
import type { Nft } from '@common/types/nft'

@Injectable()
export class EvmService {
  constructor(
    private readonly config: ConfigService,
    private readonly moralisService: HttpMoralisApiService,
    private readonly httpService: HttpService
  ) {
    this.moralisService.axiosRef.defaults.headers['X-API-Key'] = this.config.get('moralis.apiKey')
  }

  async getNft(assetId: AssetId): Promise<NftDto> {
    const chain = ethers.utils.hexlify(parseInt(assetId.chainId.reference))
    const { data, status } = await this.moralisService.axiosRef.get<MoralisResponseSearchNft>(
      `nft/${assetId.assetName.reference}/${assetId.tokenId}`,
      {
        params: {
          chain,
          format: 'decimal'
        }
      }
    )
    logger.info(data)
    if (status !== 200) throw new BadRequestException()
    return this.formatNft(assetId.chainId, data)
  }

  async getAccountNfts(accountId: AccountId, collections: string[]): Promise<NftDto[]> {
    const chain = ethers.utils.hexlify(parseInt(accountId.chainId.reference))
    const nfts: Nft[][] = []
    let cursor: string | null = ''
    while (cursor !== null) {
      const { data, status } = await this.moralisService.axiosRef.get<MoralisResponseNftsByAddress>(
        `${accountId.address}/nft`,
        {
          params: {
            chain,
            limit: 100,
            format: 'decimal',
            token_addresses: collections,
            cursor
          }
        }
      )
      if (status !== 200) throw new BadRequestException()
      const { result } = data
      cursor = data.cursor
      const results = await Promise.all(
        result.map(async (nft) => this.formatNft(accountId.chainId, nft))
      )
      nfts.push(results)
    }
    return nfts.flat()
  }

  async formatNft(chainId: ChainId, nft: MoralisResultNftsByAddress) {
    const assetId = new AssetId({
      chainId,
      assetName: {
        namespace: nft.contract_type.toLocaleLowerCase(),
        reference: nft.token_address.toLocaleLowerCase()
      },
      tokenId: nft.token_id
    })

    return {
      assetId: assetId.toJSON() as AssetIdDto,
      tokenUri: nft.token_uri,
      metadata: await this.getMetadata(nft)
    }
  }

  async getMetadata(nft: MoralisResultNftsByAddress) {
    if (nft.metadata) return JSON.parse(nft.metadata)
    const { data } = await this.httpService.axiosRef.get(nft.token_uri)
    return data
  }
}
