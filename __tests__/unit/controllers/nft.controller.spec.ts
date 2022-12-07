import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AccountId, ChainId } from 'caip'
import { SessionData } from 'express-session'

import { ChainIdReference } from '@common/enums/caip.enum'
import { NftController } from '@controllers/nft.controller'
import { BridgeService } from '@services/bridge.service'
import { NftCollectionService } from '@services/nft-collection.service'
import { UserService } from '@services/user.service'
import { EvmService } from '@services/utils/evm.service'
import { SolanaService } from '@services/utils/solana.service'
import { VenlyService } from '@services/utils/venly.service'
import { mockBridge, mockBridgeService } from '__mocks__/bridge.mock'
import { mockConfigService } from '__mocks__/config.mock'
import { mockEvmService } from '__mocks__/evm.mock'
import { mockNftCollectionService } from '__mocks__/nft-collection.mock'
import { mockNftEvm, mockNftSolana } from '__mocks__/nft.mock'
import { bridgeTxSolana, mockSolanaService } from '__mocks__/solana.mock'
import { mockUser, mockUserService, mockUserWithoutWallet } from '__mocks__/user.mock'
import { mockVenlyService } from '__mocks__/venly.mock'

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
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: BridgeService,
          useValue: mockBridgeService
        },
        {
          provide: EvmService,
          useValue: mockEvmService
        },
        {
          provide: SolanaService,
          useValue: mockSolanaService
        },
        {
          provide: VenlyService,
          useValue: mockVenlyService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
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

  describe('bridge', () => {
    it('If the user is not authenticated return unauthorized', async () => {
      const chainIdSource = 'chainIdSource'
      const chainIdDestination = 'chainIdDestination'
      const txSource = 'txSource'
      const accountIdDestination = 'accountIdDestination'
      const session = { user: undefined, destroy: () => undefined } as SessionData

      await expect(
        controller.bridge(chainIdSource, chainIdDestination, session, {
          txSource,
          accountIdDestination
        })
      ).rejects.toEqual(new UnauthorizedException())
    })

    it('If the user provides the wrong destination account id return bad request', async () => {
      const chainIdSource = 'chainIdSource'
      const chainIdDestination = 'chainIdDestination'
      const txSource = 'txSource'
      const accountIdDestination = new AccountId({
        chainId: new ChainId('namespace:reference'),
        address: mockUser.accountIds[0].address
      }).toString()
      const session = { user: mockUserWithoutWallet, destroy: () => undefined } as SessionData

      await expect(
        controller.bridge(chainIdSource, chainIdDestination, session, {
          txSource,
          accountIdDestination
        })
      ).rejects.toEqual(
        new BadRequestException(
          `Invalid accountIdDestination chain namespace:reference:${mockUser.accountIds[0].address}`
        )
      )
    })

    it('If the source or destination are invalid return bad request', async () => {
      const chainIdSource = 'chainIdSource'
      const chainIdDestination = 'namespace:reference'
      const txSource = 'txSource'
      const accountIdDestination = new AccountId({
        chainId: new ChainId(chainIdDestination),
        address: mockUser.accountIds[0].address
      }).toString()
      const session = { user: mockUser, destroy: () => undefined } as SessionData

      await expect(
        controller.bridge(chainIdSource, chainIdDestination, session, {
          txSource,
          accountIdDestination
        })
      ).rejects.toEqual(
        new BadRequestException(`Invalid bridge from ${chainIdSource} to ${chainIdDestination}`)
      )
    })

    it('If the information is valid return success', async () => {
      const chainIdSource = ChainIdReference.SOLANA_TESTNET
      const chainIdDestination = ChainIdReference.BINANCE_TESTNET
      const txSource = bridgeTxSolana
      const accountIdDestination = new AccountId({
        chainId: new ChainId(chainIdDestination),
        address: mockUser.accountIds[0].address
      }).toString()
      const session = { user: mockUser, destroy: () => undefined } as SessionData

      const response = await controller.bridge(chainIdSource, chainIdDestination, session, {
        txSource,
        accountIdDestination
      })

      expect(response).toEqual(mockNftEvm)
    })
  })
})
