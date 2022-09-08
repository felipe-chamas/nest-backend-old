import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { SoftDeleteModel } from 'mongoose-delete'

import { CreateUserDto } from '@common/dto/create-user.dto'
import { UpdateUserDto } from '@common/dto/update-user.dto'
import { NftDto } from '@common/schemas/nft.schema'
import { UserDocument, UserDto } from '@common/schemas/user.schema'
import { UserService } from '@services/user.service'
import { mockUser } from '__mocks__/user.mock'

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<NftDto>
}

const mockRepository = {
  find() {
    return [mockUser, mockUser]
  },
  save() {
    return {}
  }
}

export const repositoryMockFactory: () => MockType<SoftDeleteModel<UserDocument>> = jest.fn(() => ({
  findOne: jest.fn((entity) => entity),
  find: jest.fn().mockReturnValue([mockUser, mockUser]),
  create: jest.fn().mockReturnValue(mockUser),
  save: jest.fn().mockReturnValue(mockUser)
}))

describe('UserService', () => {
  let service: Partial<UserService>
  let userModel: SoftDeleteModel<UserDocument>

  beforeEach(async () => {
    service = {
      create: jest.fn().mockReturnValue(mockUser),
      findAll: jest.fn().mockReturnValue([mockUser, mockUser]),
      findById: jest.fn().mockReturnValue(mockUser),
      update: jest.fn().mockReturnValue(mockUser),
      remove: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: service
        },
        {
          provide: getModelToken(UserDto.name),
          useValue: mockRepository
        }
      ]
    }).compile()

    service = module.get<UserService>(UserService)
    userModel = module.get(getModelToken(UserDto.name))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('it should create an user', async () => {
    const result = await service.create(mockUser as CreateUserDto)
    expect(result._id).toEqual(mockUser._id)
  })

  it('should fetch all users', async () => {
    const users = await userModel.find()
    const result = await service.findAll({ limit: 10, skip: 0, sort: {} })
    expect(result).toEqual(users)
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
