import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { SoftDeleteModel } from 'mongoose-delete'

import { CreateNftDto } from '@common/dto/create-nft.dto'
import { NftDocument, NftDto } from '@common/schemas/nft.schema'
import { NftService } from '@services/nft.service'
import { mockNft } from '__mocks__/nft.mock'

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<NftDto>
}

const mockRepository = {
  find() {
    return [mockNft, mockNft]
  },
  save() {
    return {}
  }
}

export const repositoryMockFactory: () => MockType<SoftDeleteModel<NftDocument>> = jest.fn(() => ({
  findOne: jest.fn((entity) => entity),
  find: jest.fn().mockReturnValue([mockNft, mockNft]),
  create: jest.fn().mockReturnValue(mockNft),
  save: jest.fn().mockReturnValue(mockNft)
}))

describe('NftService', () => {
  let service: Partial<NftService>
  let nftModel: SoftDeleteModel<NftDocument>

  beforeEach(async () => {
    service = {
      create: jest.fn().mockReturnValue(mockNft),
      findAll: jest.fn().mockReturnValue([mockNft, mockNft]),
      findById: jest.fn().mockReturnValue(mockNft),
      update: jest.fn().mockReturnValue(mockNft),
      remove: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: NftService, useValue: service },
        {
          provide: getModelToken(NftDto.name),
          useValue: mockRepository
        }
      ]
    }).compile()

    service = module.get<NftService>(NftService)
    nftModel = module.get(getModelToken(NftDto.name))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create an nft', async () => {
    const result = await service.create(mockNft as CreateNftDto)
    expect(result).toEqual(mockNft)
  })

  it('should find an nft', async () => {
    const result = await service.findById(mockNft._id)
    expect(result).toEqual(mockNft)
  })

  it('should find all nfts', async () => {
    const nfts = await nftModel.find()
    const result = await service.findAll({ limit: 10, skip: 0, sort: {} })
    expect(result).toEqual(nfts)
  })

  it('should update an nft', async () => {
    const result = await service.update(mockNft._id, {
      metadata: { ...mockNft.metadata, description: 'New Description' }
    })
    expect(result).toEqual(mockNft)
  })

  it('should delete an nft', async () => {
    const nft = mockNft
    const id = nft.id as unknown as string

    const result = await service.remove(id)

    expect(result).toBeUndefined()
  })
})
