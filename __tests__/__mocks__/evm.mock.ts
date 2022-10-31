import { BadRequestException } from '@nestjs/common'
import { AccountId, AssetId } from 'caip'

import { MoralisResultNftsByAddress } from '@common/types/moralis'
import { EvmService } from '@services/utils/evm.service'

import { mockNftEvm } from './nft.mock'

export const mockEvmService: Partial<EvmService> = {
  getNft: jest.fn().mockImplementation(async (assetId: AssetId) => {
    if (!assetId) throw new BadRequestException()
    const response = { ...mockNftEvm, assetId }
    return response
  }),

  getAccountNfts: jest
    .fn()
    .mockImplementation(async (accountId: AccountId, collections: string[]) => {
      if (!accountId) throw new BadRequestException()
      const results = collections.map((address) => {
        const nft = { ...mockNftEvm }
        nft.assetId.assetName.reference = address
        return nft
      })
      return results
    }),

  getMetadata: jest.fn().mockImplementation(async (nft: MoralisResultNftsByAddress) => {
    if (nft.metadata) return JSON.parse(nft.metadata)
    return {
      name: 'name',
      description: 'nft description',
      image: 'nft image url',
      attributes: 'nft traits'
    }
  })
}
