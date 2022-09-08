import { Test, TestingModule } from '@nestjs/testing'
import { SessionData } from 'express-session'
import { ObjectId } from 'mongoose'

import { UpdateUserDto } from '@common/dto/update-user.dto'
import { Role } from '@common/enums/role.enum'
import { UserDocument } from '@common/schemas/user.schema'
import { UserController } from '@controllers/user.controller'
import { UserService } from '@services/user.service'
import { mockUser, mockAdmin } from '__mocks__/user.mock'

type UserResult = UserDocument & { _id: ObjectId }

describe('UserController', () => {
  let controller: UserController
  let service: Partial<UserService>

  beforeEach(async () => {
    service = {
      findAll: () => Promise.resolve({ data: [mockUser as UserResult], total: 1 }),
      findByUUID: jest.fn().mockImplementation(async (uuid: string) => {
        return { ...mockUser, uuid: uuid } as UserResult
      }),
      update: (_: string, updatedUser: Partial<UpdateUserDto>) =>
        Promise.resolve({
          ...mockUser,
          ...updatedUser
        } as UserResult),
      remove: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: service
        }
      ]
    }).compile()

    controller = module.get<UserController>(UserController)
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

  describe('Update', () => {
    it('should update an user', async () => {
      const updatedUser = {
        email: 'testEmail@test.com',
        roles: [Role.USER_ADMIN]
      } as UpdateUserDto

      const result = await controller.update(mockUser._id, updatedUser, {
        user: { id: mockAdmin._id, roles: mockAdmin.roles }
      } as SessionData)

      expect(result).toMatchObject(updatedUser)
    })

    it('should not update roles when logged in user is not ROLES_ADMIN', async () => {
      const result = await controller.update(
        mockUser._id,
        {
          email: 'testEmail@test.com',
          roles: [Role.USER_ADMIN]
        } as UpdateUserDto,
        { user: { id: mockUser._id, roles: mockUser.roles } } as SessionData
      )

      expect(result).toMatchObject({ roles: [] })
    })
  })

  it('should delete an user', () => {
    controller.remove(mockUser._id)
    expect(service.remove).toHaveBeenCalledWith(mockUser._id)
  })
})
