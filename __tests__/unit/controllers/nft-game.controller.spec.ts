import { NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AccountId } from 'caip'

import { NftGameController } from '@controllers/nft-game.controller'
import { UserService } from '@services/user.service'
import { EvmService } from '@services/utils/evm.service'
import { VenlyService } from '@services/utils/venly.service'
import { mockEvmService } from '__mocks__/evm.mock'
import { mockUserService, mockUser } from '__mocks__/user.mock'
import { mockVenlyService, tokenBalnceResponse, transactionResponse } from '__mocks__/venly.mock'

import { mockNftEvm } from '../../__mocks__/nft.mock'

describe('nftGameController', () => {
  let controller: NftGameController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftGameController],
      providers: [
        {
          provide: VenlyService,
          useValue: mockVenlyService
        },
        {
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: EvmService,
          useValue: mockEvmService
        },
        {
          provide: ConfigService,
          useValue: { get: () => '97' }
        }
      ]
    }).compile()

    controller = module.get<NftGameController>(NftGameController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getUserNfts', () => {
    it('If user not exist throw an error', async () => {
      const uuid = 'badUUID'
      try {
        await controller.getUserNfts(uuid, { nfts: '' })
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
      }
    })
    it('getNfts must be called with correct data', async () => {
      await controller.getUserNfts(mockUser.uuid, { nfts: ['testNft'] })
      const mockFunction = mockEvmService.getAccountNfts as jest.Mock
      const accountId = new AccountId({
        address: mockUser.wallet.address,
        chainId: {
          namespace: 'eip155',
          reference: '97'
        }
      })
      expect(mockFunction.mock.calls[0][0]).toMatchObject(accountId)
      expect(mockFunction.mock.calls[0][1]).toMatchObject(['testNft'])
    })
    it('must return correct data', async () => {
      const response = await controller.getUserNfts(mockUser.uuid, { nfts: ['testNft'] })
      expect(response).toMatchObject([mockNftEvm])
    })
  })

  describe('getUserBalance', () => {
    it('If user not exist throw an error', async () => {
      const uuid = 'badUUID'
      try {
        await controller.getUserBalance(uuid, { token: 'testToken' })
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
      }
    })

    it('getNfts must be called with correct data', async () => {
      await controller.getUserBalance(mockUser.uuid, { token: 'testToken' })

      const mockFunction = mockVenlyService.getTokenBalance as jest.Mock
      expect(mockFunction.mock.calls[0][0]).toMatchObject({
        walletId: mockUser.wallet.id,
        token: 'testToken'
      })
    })
    it('must return correct data', async () => {
      const response = await controller.getUserBalance(mockUser.uuid, { token: 'testToken' })
      expect(response).toMatchObject(tokenBalnceResponse.result)
    })
  })

  describe('upgrade', () => {
    const assetIdTest = {
      chainId: {
        namespace: 'namespace-chain-id',
        reference: 'reference-chain-id'
      },
      assetName: {
        namespace: 'namespace-asset',
        reference: 'reference-asset'
      },
      tokenId: 'tokenId'
    }

    it('If user not exist throw an error', async () => {
      const uuid = 'badUUID'
      try {
        await controller.upgrade({
          uuid: uuid,
          assetId: assetIdTest,
          value: 2,
          pincode: 'code'
        })
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
      }
    })

    it('upgrade must be called with correct data', async () => {
      await controller.upgrade({
        uuid: mockUser.uuid,
        assetId: assetIdTest,
        value: 2,
        pincode: 'code'
      })

      const mockFunction = mockVenlyService.upgrade as jest.Mock

      expect(mockFunction.mock.calls[0][0]).toMatchObject({
        walletId: mockUser.wallet.id,
        assetId: assetIdTest,
        value: 2,
        pincode: 'code'
      })
    })

    it('must return correct data', async () => {
      const response = await controller.upgrade({
        uuid: mockUser.uuid,
        assetId: assetIdTest,
        value: 2,
        pincode: 'code'
      })
      expect(response).toMatchObject(transactionResponse.result)
    })
  })

  describe('unbox', () => {
    const assetIdTest = {
      chainId: {
        namespace: 'namespace-chain-id',
        reference: 'reference-chain-id'
      },
      assetName: {
        namespace: 'namespace-asset',
        reference: 'reference-asset'
      },
      tokenId: 'tokenId'
    }
    it('If user not exist throw an error', async () => {
      const uuid = 'badUUID'
      try {
        await controller.unbox({
          uuid: uuid,
          assetId: assetIdTest,
          pincode: 'code'
        })
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
      }
    })

    it('unbox must be called with correct data', async () => {
      await controller.unbox({
        uuid: mockUser.uuid,
        assetId: assetIdTest,
        pincode: 'code'
      })

      const mockFunction = mockVenlyService.unbox as jest.Mock

      expect(mockFunction.mock.calls[0][0]).toMatchObject(assetIdTest)
    })

    it('must return correct data', async () => {
      const response = await controller.unbox({
        uuid: mockUser.uuid,
        assetId: assetIdTest,
        pincode: 'code'
      })
      expect(response).toMatchObject(transactionResponse.result)
    })
  })
})
