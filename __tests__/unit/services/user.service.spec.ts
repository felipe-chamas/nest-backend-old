import { ConfigService } from '@nestjs/config'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'

import { UserDto } from '@common/schemas/user.schema'
import { UserService } from '@services/user.service'
import { HttpSteamApiService } from '@services/utils/steam/api.service'
import { VenlyService } from '@services/utils/venly.service'
import { mockConfigService } from '__mocks__/config.mock'
import { mockSteamApiService } from '__mocks__/steam.mock'
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
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: VenlyService,
          useValue: mockVenlyService
        },
        {
          provide: HttpSteamApiService,
          useValue: mockSteamApiService
        }
      ]
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should fetch a user', async () => {
    const result = await service.findByUUID(mockUser.uuid)
    expect(result.uuid).toBeTruthy()
  })

  it('should update a user', async () => {
    const result = await service.update(mockUser.uuid, { name: 'New Name' })
    expect(result.name).toEqual(mockUser.name)
  })

  it('should remove a user', async () => {
    const result = await service.remove(mockUser.uuid)
    expect(result).toBeUndefined()
  })
})
