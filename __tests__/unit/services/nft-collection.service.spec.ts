import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { SoftDeleteModel } from 'mongoose-delete'

import { CreateNftCollectionDto } from '@common/dto/create-nft-collection.dto'
import { NftCollectionDocument, NftCollectionDto } from '@common/schemas/nft-collection.schema'
import { NftCollectionService } from '@services/nft-collection.service'
import { mockNftCollection } from '__mocks__/nft-collection.mock'

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<SoftDeleteModel<NftCollectionDocument>>
}

const mockRepository = {
  find() {
    return [mockNftCollection, mockNftCollection]
  },
  save() {
    return {}
  }
}

export const repositoryMockFactory: () => MockType<SoftDeleteModel<NftCollectionDocument>> =
  jest.fn(() => ({
    findOne: jest.fn((entity) => entity),
    find: jest.fn().mockReturnValue([mockNftCollection, mockNftCollection]),
    create: jest.fn().mockReturnValue(mockNftCollection),
    save: jest.fn().mockReturnValue(mockNftCollection)
  }))

describe('NftCollectionService', () => {
  let service: Partial<NftCollectionService>
  let nftCollectionModel: SoftDeleteModel<NftCollectionDocument>

  beforeEach(async () => {
    service = {
      create: jest.fn().mockReturnValue(mockNftCollection),
      findAll: jest.fn().mockReturnValue([mockNftCollection, mockNftCollection]),
      findById: jest.fn().mockReturnValue(mockNftCollection),
      update: jest.fn().mockReturnValue(mockNftCollection),
      remove: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: NftCollectionService,
          useValue: service
        },
        {
          provide: getModelToken(NftCollectionDto.name),
          useValue: mockRepository
        }
      ]
    }).compile()

    service = module.get<NftCollectionService>(NftCollectionService)
    nftCollectionModel = module.get(getModelToken(NftCollectionDto.name))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create an nftCollection', async () => {
    const result = await service.create(mockNftCollection as CreateNftCollectionDto)
    expect(result).toEqual(mockNftCollection)
  })

  it('should fetch all nftCollections', async () => {
    const nftCollections = await nftCollectionModel.find()
    const result = await service.findAll({ limit: 10, skip: 0, sort: {} })
    expect(result).toEqual(nftCollections)
  })

  it('should fetch a nftCollection', async () => {
    const result = await service.findById(mockNftCollection._id)
    expect(result._id).toBe(mockNftCollection._id)
  })

  it('should update a nftCollection', async () => {
    const result = await service.update(mockNftCollection._id, { name: 'New Name' })
    expect(result).toEqual(mockNftCollection)
  })

  it('should remove a nftCollection', async () => {
    const result = await service.remove(mockNftCollection._id)
    expect(result).toBeUndefined()
  })
})
