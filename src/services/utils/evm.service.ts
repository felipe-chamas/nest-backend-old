import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AccountId, AssetId } from 'caip'
import { ethers } from 'ethers'

import {
  MoralisResponseNftsByAddress,
  MoralisResponseSearchNft,
  MoralisResultNftsByAddress
} from '@common/types/moralis'

import { HttpMoralisApiService } from './moralis/api.service'

@Injectable()
export class EvmService {
  constructor(
    private readonly config: ConfigService,
    private readonly moralisService: HttpMoralisApiService
  ) {
    this.moralisService.axiosRef.defaults.headers['X-API-Key'] = this.config.get('moralis.apiKey')
  }

  async getNft(assetId: AssetId) {
    const chain = ethers.utils.hexlify(parseInt(assetId.chainId.reference))
    const { data } = await this.moralisService.axiosRef.get<MoralisResponseSearchNft>(
      `nft/${assetId.assetName.reference}/${assetId.tokenId}`,
      {
        params: {
          chain,
          format: 'decimal'
        }
      }
    )
    return { ...data, metadata: JSON.parse(data.metadata) }
  }

  async getAccountNfts(accountId: AccountId, collections: string[]) {
    const chain = ethers.utils.hexlify(parseInt(accountId.chainId.reference))

    const nfts: MoralisResultNftsByAddress[][] = []
    let cursor: string | null = ''
    while (cursor !== null) {
      const { data } = await this.moralisService.axiosRef.get<MoralisResponseNftsByAddress>(
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
      const { result } = data
      cursor = data.cursor
      nfts.push(result)
    }

    return nfts.flat()
  }
}
