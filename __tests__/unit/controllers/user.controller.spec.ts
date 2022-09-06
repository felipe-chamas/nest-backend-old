import { Test, TestingModule } from '@nestjs/testing'
import { SessionData } from 'express-session'

import { UserDto } from '@common/dto/entities/user.dto'
import { UpdateUserDto } from '@common/dto/update-user.dto'
import { Role } from '@common/enums/role.enum'
import { UserController } from '@controllers/user.controller'
import { UserService } from '@services/user.service'
import { mockUser, mockAdmin } from '__mocks__/user.mock'

describe('UserController', () => {
  let controller: UserController
  let service: Partial<UserService>

  beforeEach(async () => {
    service = {
      findAll: () => Promise.resolve([mockUser as UserDto]),
      findByUUID: jest.fn().mockImplementation(async (uuid: string) => {
        return { ...mockUser, uuid: uuid } as UserDto
      }),
      update: (_: string, updatedUser: Partial<UpdateUserDto>) =>
        Promise.resolve({
          ...updatedUser
        } as unknown as UserDto),
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

      const result = await controller.update(mockUser.id.toString(), updatedUser, {
        user: mockAdmin
      } as unknown as SessionData)

      expect(result).toMatchObject(updatedUser)
    })

    it('should not update roles when logged in user is not ROLES_ADMIN', async () => {
      const result = await controller.update(
        mockUser.id.toString(),
        {
          email: 'testEmail@test.com',
          roles: [Role.USER_ADMIN]
        } as UpdateUserDto,
        { user: mockUser } as unknown as SessionData
      )

      expect(result).toMatchObject({ roles: [] })
    })
  })

  it('should delete an user', () => {
    controller.remove(mockUser.id.toString())
    expect(service.remove).toHaveBeenCalledWith(mockUser.id)
  })
})
