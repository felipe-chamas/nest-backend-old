import { HttpService } from '@nestjs/axios'
import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AccountId, AssetId } from 'caip'

import {
  ExternalApiNft,
  QuickNodeFetchNftsResponse,
  SolscanTokenAccountResponse
} from '@common/types/quicknode'

import { HttpQuicknodeApiService } from './quicknode/api.service'

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
        : 'https://public-api-test.solscan.io/docs/'
  }

  async getNft(assetId: AssetId) {
    const { data } = await this.httpService.axiosRef.get<SolscanTokenAccountResponse>(
      `account/${assetId.assetName.reference}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    return data
  }

  async getAccountNfts(accountId: AccountId) {
    const nfts: ExternalApiNft[][] = []
    const { data } = await this.quicknodeService.axiosRef.post<QuickNodeFetchNftsResponse>('', {
      jsonrpc: '2.0',
      id: 1,
      method: 'qn_fetchNFTs',
      params: {
        wallet: accountId.address,
        omitFields: ['provenance', 'creators'],
        page: 1,
        perPage: 40
      }
    })

    if (!data) throw new NotFoundException(`Wallet not found: ${accountId.address}`)

    const {
      result: { totalPages, assets }
    } = data

    nfts.push(assets)

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
        nfts.push(result.assets)
      })
    )

    return nfts.flat()
  }
}
