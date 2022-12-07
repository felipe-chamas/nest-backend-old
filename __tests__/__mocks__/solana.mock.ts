import { BadRequestException, NotFoundException } from '@nestjs/common'
import { AccountId, ChainId } from 'caip'

import { SolanaService } from '@services/utils/solana.service'

import { mockNftSolana } from './nft.mock'
import { mockUser } from './user.mock'

export const nonFungibleResponseSolana = {
  assetId: '',
  tokenUri: '',
  metadata: ''
}

export const bridgeTxSolana = '0xabcd'
export const bridgeAddress = '0xfefe'

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
  }),
  getNftTransaction: jest.fn().mockImplementation(async (chainId: ChainId, txSource: string) => {
    if (txSource == bridgeTxSolana)
      return {
        from: new AccountId(mockUser.accountIds[0]).toString(),
        to: bridgeAddress,
        nft: mockNftSolana
      }
    else throw new NotFoundException(`Transaction not found: ${txSource}`)
  })
}
