import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'

import { UpdateUserDto } from '@common/dto/update-user.dto'
import { UserDto } from '@common/schemas/user.schema'
import { UserService } from '@services/user.service'
import { VenlyService } from '@services/utils/venly.service'
import { mockUser, userModelMockFactory } from '__mocks__/user.mock'
import { mockVenlyService } from '__mocks__/venly.mock'

describe('UserService', () => {
  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(UserDto.name),
          useValue: userModelMockFactory()
        },
        {
          provide: VenlyService,
          useValue: mockVenlyService
        }
      ]
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should fetch a user', async () => {
    const result = await service.findById(mockUser._id)
    expect(result._id).toBeTruthy()
  })

  it('should update a user', async () => {
    const result = await service.update(mockUser._id, { name: 'New Name' } as UpdateUserDto)
    expect(result.name).toEqual(mockUser.name)
  })

  it('should remove a user', async () => {
    const result = await service.remove(mockUser._id)
    expect(result).toBeUndefined()
  })
})
