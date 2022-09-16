import { Test, TestingModule } from '@nestjs/testing'
import { SessionData } from 'express-session'

import { Role } from '@common/enums/role.enum'
import { UserController } from '@controllers/user.controller'
import { UserService } from '@services/user.service'
import { VenlyService } from '@services/utils/venly.service'
import { mockUser, mockAdmin, mockUserService } from '__mocks__/user.mock'
import { mockVenlyService } from '__mocks__/venly.mock'

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
})
