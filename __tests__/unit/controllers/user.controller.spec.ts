import { Test, TestingModule } from '@nestjs/testing'
import { SessionData } from 'express-session'

import { UpdateUserDto } from '@common/dto/update-user.dto'
import { Role } from '@common/enums/role.enum'
import { UserController } from '@controllers/user.controller'
import { UserService } from '@services/user.service'
import { mockUser, mockAdmin, mockUserService } from '__mocks__/user.mock'

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
