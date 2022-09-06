import { Nft } from '@common/entities/nft.entity'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { MongoRepository } from 'typeorm'

import { NftCollection } from '@common/dto/entities/nft-collection.entity'
import { NftCollectionService } from '@services/nft-collection.service'
import { mockCreateNftCollection, mockNftCollection } from '__mocks__/nft-collection.mock'

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<Nft>
}

export const repositoryMockFactory: () => MockType<MongoRepository<NftCollection>> = jest.fn(
  () => ({
    findOne: jest.fn((entity) => entity),
    find: jest.fn().mockReturnValue([mockNftCollection, mockNftCollection]),
    create: jest.fn().mockReturnValue(mockNftCollection),
    save: jest.fn().mockReturnValue(mockNftCollection)
  })
)

describe('NftCollectionService', () => {
  let nftCollection
  let service: Partial<NftCollectionService>
  let nftCollectionRepo: MongoRepository<NftCollection>

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
          provide: getRepositoryToken(NftCollection),
          useFactory: repositoryMockFactory
        }
      ]
    }).compile()

    service = module.get<NftCollectionService>(NftCollectionService)
    nftCollectionRepo = module.get(getRepositoryToken(NftCollection))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create an nftCollection', async () => {
    nftCollection = nftCollectionRepo.create(mockCreateNftCollection)
    await nftCollectionRepo.save(nftCollection)

    const result = await service.create(mockCreateNftCollection)
    expect(result).toEqual({ ...mockCreateNftCollection, ...result })
  })

  it('should fetch all nftCollections', async () => {
    const nftCollections = await nftCollectionRepo.find()
    const result = await service.findAll({ query: [] })
    expect(result).toEqual(nftCollections)
  })

  it('should fetch a nftCollection', async () => {
    nftCollection = nftCollectionRepo.create(mockCreateNftCollection)
    await nftCollectionRepo.save(nftCollection)

    const result = await service.findById(nftCollection.id)

    expect(result.id).toBe(mockNftCollection.id)
  })

  it('should update a nftCollection', async () => {
    nftCollection = nftCollectionRepo.create(mockCreateNftCollection)
    await nftCollectionRepo.save(nftCollection)

    const result = await service.update(nftCollection.id, nftCollection)
    expect(result).toEqual({ ...nftCollection, ...result })
  })

  it('should remove a nftCollection', async () => {
    nftCollection = nftCollectionRepo.create(mockCreateNftCollection)
    await nftCollectionRepo.save(nftCollection)

    const result = await service.remove(nftCollection.id)
    expect(result).toBeUndefined()
  })
})
