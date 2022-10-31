import { BadRequestException, NotFoundException } from '@nestjs/common'
import { AccountId } from 'caip'

import { SolanaService } from '@services/utils/solana.service'

import { mockNftSolana } from './nft.mock'

export const nonFungibleResponseSolana = {
  assetId: '',
  tokenUri: '',
  metadata: ''
}

export const mockSolanaService: Partial<SolanaService> = {
  getNft: jest.fn().mockImplementation(async (assetId) => {
    if (!assetId) throw new BadRequestException()
    return { ...mockNftSolana, assetId }
  }),
  getAccountNfts: jest.fn().mockImplementation(async (accountId: AccountId) => {
    if (!accountId) throw new BadRequestException()
    if (accountId.address === 'notFound')
      throw new NotFoundException(`Wallet not found: ${accountId.address}`)
    return [mockNftSolana]
  })
}
