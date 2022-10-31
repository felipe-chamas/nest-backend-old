import { Test, TestingModule } from '@nestjs/testing'

import { NftController } from '@controllers/nft.controller'
import { NftCollectionService } from '@services/nft-collection.service'
import { EvmService } from '@services/utils/evm.service'
import { SolanaService } from '@services/utils/solana.service'
import { mockEvmService } from '__mocks__/evm.mock'
import { mockNftCollectionService } from '__mocks__/nft-collection.mock'
import { mockNftEvm, mockNftSolana } from '__mocks__/nft.mock'
import { mockSolanaService } from '__mocks__/solana.mock'

describe('NftController', () => {
  let controller: NftController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftController],
      providers: [
        {
          provide: NftCollectionService,
          useValue: mockNftCollectionService
        },
        {
          provide: EvmService,
          useValue: mockEvmService
        },
        {
          provide: SolanaService,
          useValue: mockSolanaService
        }
      ]
    }).compile()

    controller = module.get<NftController>(NftController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findOne', () => {
    it('If the asset type does not exist return undefined', async () => {
      const chainId = 'badChainId:1'
      const assetName = 'badAssetName:badAddress'
      const tokenId = '1'
      const result = await controller.findOne(chainId, assetName, tokenId)
      expect(result).toBeUndefined()
    })

    it('must return correct data for evm chain', async () => {
      const response = await controller.findOne(
        `${mockNftEvm.assetId.chainId.namespace}:${mockNftEvm.assetId.chainId.reference}`,
        `${mockNftEvm.assetId.assetName.namespace}:${mockNftEvm.assetId.assetName.reference}`,
        mockNftEvm.assetId.tokenId
      )

      expect(response).toEqual(mockNftEvm)
    })

    it('must return correct data for solana chain', async () => {
      const response = await controller.findOne(
        `${mockNftSolana.assetId.chainId.namespace}:${mockNftSolana.assetId.chainId.reference}`,
        `${mockNftSolana.assetId.assetName.namespace}:${mockNftSolana.assetId.assetName.reference}`,
        mockNftSolana.assetId.tokenId
      )

      expect(response).toEqual(mockNftSolana)
    })
  })

  describe('findByAccount', () => {
    it('If the asset type does not exist return undefined', async () => {
      const chainId = 'badChainId:1'
      const address = '0x274A150E002C70B79CE20FD48D484A8657554ECD'
      const nftCollectionAddresses = ['address'] as string[]
      const response = await controller.findByAccount(chainId, address, nftCollectionAddresses)

      expect(response).toBeUndefined()
    })

    it('must return correct data for evm chain', async () => {
      const { chainId, address, nftCollectionAddresses } = {
        chainId: 'eip155:56',
        address: '0x274A150E002C70B79CE20FD48D484A8657554ECD',
        nftCollectionAddresses: ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1vp']
      }

      const expectResult = { ...mockNftEvm }
      expectResult.assetId.assetName.reference = nftCollectionAddresses[0]

      const response = await controller.findByAccount(chainId, address, nftCollectionAddresses)
      expect(response[0]).toEqual(expectResult)
    }),
      it('must return correct data for solan chain', async () => {
        const { chainId, address, nftCollectionAddresses } = {
          chainId: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
          address: '0x274A150E002C70B79CE20FD48D484A8657554ECD',
          nftCollectionAddresses: [mockNftSolana.assetId.assetName.reference]
        }

        const response = await controller.findByAccount(chainId, address, nftCollectionAddresses)
        expect(response[0]).toEqual(mockNftSolana)
      })
  })
})
