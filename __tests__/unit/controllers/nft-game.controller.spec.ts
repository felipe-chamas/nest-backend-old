import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { NftGameController } from '@controllers/nft-game.controller'
import { UserService } from '@services/user.service'
import { VenlyService } from '@services/utils/venly.service'
import { mockUserService, mockUser } from '__mocks__/user.mock'
import { mockVenlyService, nonFungibleResponse, tokenBalnceResponse } from '__mocks__/venly.mock'

describe('nftGameController', () => {
  let controller: NftGameController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftGameController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: VenlyService,
          useValue: mockVenlyService
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
      await controller.getUserNfts('testUUID', { nfts: 'testNft' })
      const mockFunction = mockVenlyService.getNfts as jest.Mock
      expect(mockFunction.mock.calls[0][0]).toMatchObject({
        walletId: mockUser.wallet.id,
        nfts: 'testNft'
      })
    })
    it('must return correct data', async () => {
      const response = await controller.getUserNfts('testUUID', { nfts: 'testNft' })
      expect(response).toMatchObject(nonFungibleResponse.result)
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
      await controller.getUserBalance('testUUID', { token: 'testToken' })
      const mockFunction = mockVenlyService.getTokenBalance as jest.Mock
      expect(mockFunction.mock.calls[0][0]).toMatchObject({
        walletId: mockUser.wallet.id,
        token: 'testToken'
      })
    })
    it('must return correct data', async () => {
      const response = await controller.getUserBalance('testUUID', { token: 'testToken' })
      expect(response).toMatchObject(tokenBalnceResponse.result)
    })
  })
})
