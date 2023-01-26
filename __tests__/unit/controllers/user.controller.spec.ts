import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { SessionData } from 'express-session'

import { Role } from '@common/enums/role.enum'
import { UserController } from '@controllers/user.controller'
import { UserService } from '@services/user.service'
import { VenlyService } from '@services/utils/venly.service'
import { testSteamId } from '__mocks__/dbUsers'
import {
  mockUser,
  mockAdmin,
  mockUserService,
  findOrCreateBySteamIdResponse,
  testElixirId,
  testElixirJwt
} from '__mocks__/user.mock'
import { mockVenlyService, createWalletResponse } from '__mocks__/venly.mock'

describe('UserController', () => {
  let controller: UserController
  let service: Partial<UserService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
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

    controller = module.get<UserController>(UserController)
    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should fetch an user', async () => {
    const result = await controller.findByUUID(mockUser.uuid)

    expect(result).toMatchObject({
      email: mockUser.email,
      name: mockUser.name
    })
  })

  describe('createWallet', () => {
    const pincode = '123456'
    const uuid = mockUser.uuid
    it('If user not exist throw an error', async () => {
      const uuid = 'badUUID'
      try {
        await controller.createWallet({
          uuid: uuid,
          pincode: pincode
        })
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
      }
    })
    it('createWallet must be called with correct data', async () => {
      await controller.createWallet({ uuid, pincode: pincode })
      const mockFunction = mockVenlyService.createWallet as jest.Mock
      expect(mockFunction.mock.calls[0][0]).toMatchObject({
        pincode: pincode,
        uuid: uuid
      })
    })
    it('must return correct data', async () => {
      const response = await controller.createWallet({ uuid, pincode: pincode })
      expect(response.wallet).toMatchObject(createWalletResponse.result)
    })
  })

  describe('Update', () => {
    it('should update an user', async () => {
      const updatedUser = {
        email: 'testEmail@test.com',
        roles: [Role.USER_ADMIN]
      }

      const result = await controller.update(mockUser.uuid, updatedUser, {
        user: { uuid: mockAdmin.uuid, roles: mockAdmin.roles }
      } as SessionData)

      expect(result).toMatchObject(updatedUser)
    })

    it('should not update roles when logged in user is not ROLES_ADMIN', async () => {
      const result = await controller.update(
        mockUser.uuid,
        {
          email: 'testEmail@test.com',
          roles: [Role.USER_ADMIN]
        },
        { user: { uuid: mockUser.uuid, roles: mockUser.roles } } as SessionData
      )

      expect(result).toMatchObject({ roles: [] })
    })
  })

  it('should delete an user', () => {
    controller.remove(mockUser.uuid)
    expect(service.remove).toHaveBeenCalledWith(mockUser.uuid)
  })

  describe('findBySteamId', () => {
    it('findBySteamId must be called with correct data', async () => {
      await controller.findBySteamId(testSteamId)
      const mockFunction = mockUserService.findOrCreateBySteamId as jest.Mock
      expect(mockFunction.mock.calls[0][0]).toEqual(testSteamId)
    })
    it('must return correct data', async () => {
      const response = await controller.findBySteamId(testSteamId)
      expect(response).toMatchObject(findOrCreateBySteamIdResponse.result)
    })
  })

  describe('findOrCreateElixirUser', () => {
    it('must return correct data', async () => {
      const response = await controller.findOrCreateElixirUser(testElixirId, { jwt: testElixirJwt })
      expect(response).toMatchObject(mockUser)
    })
  })
})
