import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { MongoRepository } from 'typeorm'

import { NftDto } from '@common/dto/entities/nft.dto'
import { NftService } from '@services/nft.service'
import { mockCreateNft, mockUpdateNft, mockNft } from '__mocks__/nft.mock'

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<NftDto>
}

export const repositoryMockFactory: () => MockType<MongoRepository<NftDto>> = jest.fn(() => ({
  findOne: jest.fn((entity) => entity),
  find: jest.fn().mockReturnValue([mockCreateNft, mockCreateNft]),
  create: jest.fn().mockReturnValue(mockCreateNft),
  save: jest.fn().mockReturnValue(mockCreateNft)
}))

describe('NftService', () => {
  let service: Partial<NftService>
  let neftRepo: MockType<MongoRepository<NftDto>>

  beforeEach(async () => {
    service = {
      create: jest.fn().mockReturnValue(mockCreateNft),
      findAll: jest.fn().mockReturnValue([mockCreateNft, mockCreateNft]),
      findById: jest.fn().mockReturnValue(mockCreateNft),
      update: jest.fn().mockReturnValue(mockUpdateNft),
      remove: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: NftService, useValue: service },
        {
          provide: getRepositoryToken(NftDto),
          useFactory: repositoryMockFactory
        }
      ]
    }).compile()

    service = module.get<NftService>(NftService)
    neftRepo = module.get(getRepositoryToken(NftDto))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create an nft', async () => {
    const nft = neftRepo.create(mockCreateNft)
    await neftRepo.save(nft)

    const result = await service.create(mockCreateNft)
    expect(result).toEqual({ ...mockCreateNft, ...result })
  })

  it('should find an nft', async () => {
    const nft = neftRepo.create(mockCreateNft)
    await neftRepo.save(nft)

    const id = nft.id
    const result = await service.findById(id.toString())
    expect(result).toEqual({ ...mockCreateNft, ...result })
  })

  it('should find all nfts', async () => {
    const nfts = await neftRepo.find()
    const result = await service.findAll({ query: [] })
    expect(result).toEqual(nfts)
  })

  it('should update an nft', async () => {
    const nft = neftRepo.create(mockCreateNft)
    await neftRepo.save(nft)

    const nftId = nft.id as unknown as string
    const result = await service.update(nftId, mockUpdateNft)
    expect(result).toEqual({ ...mockUpdateNft, ...result })
  })

  it('should delete an nft', async () => {
    const nft = mockNft
    const id = nft.id as unknown as string

    const result = await service.remove(id)

    expect(result).toBeUndefined()
  })
})
