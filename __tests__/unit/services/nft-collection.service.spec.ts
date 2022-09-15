import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'

import { NftCollectionDto } from '@common/schemas/nft-collection.schema'
import { NftCollectionService } from '@services/nft-collection.service'
import { mockNftCollection, nftCollectionModelMockFactory } from '__mocks__/nft-collection.mock'

describe('NftCollectionService', () => {
  let service: NftCollectionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NftCollectionService,
        {
          provide: getModelToken(NftCollectionDto.name),
          useValue: nftCollectionModelMockFactory()
        }
      ]
    }).compile()

    service = module.get<NftCollectionService>(NftCollectionService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should fetch all nftCollections', async () => {
    const result = await service.findAll({ limit: 10, skip: 0, sort: {} })
    expect(result).toEqual({ data: [mockNftCollection, mockNftCollection], total: 2 })
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
