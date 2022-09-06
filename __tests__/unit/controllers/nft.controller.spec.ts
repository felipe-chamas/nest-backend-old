import { Test, TestingModule } from '@nestjs/testing'
import { Request } from 'express'
import { ObjectID } from 'typeorm'

import { CreateNftDto } from '@common/dto/create-nft.dto'
import { NftDto } from '@common/dto/entities/nft.dto'
import { UpdateNftDto } from '@common/dto/update-nft.dto'
import { NftController } from '@controllers/nft.controller'
import { NftCollectionService } from '@services/nft-collection.service'
import { NftService } from '@services/nft.service'
import { mockNft, mockCreateNft, mockCreateNftResponse } from '__mocks__/nft.mock'
import { mockUser } from '__mocks__/user.mock'

describe('NftController', () => {
  let controller: NftController
  let service: Partial<NftService>
  const nftCollectionService = NftCollectionService.prototype

  beforeEach(async () => {
    service = {
      create: (createNftDto: CreateNftDto) =>
        Promise.resolve({
          ...mockCreateNftResponse,
          ...createNftDto
        } as unknown as NftDto),
      findAll: () => Promise.resolve([]),
      findById: jest.fn().mockImplementation(async () => {
        return {
          ...mockNft,
          user: mockUser
        }
      }),
      update: (_: string, updatedNft: UpdateNftDto) =>
        Promise.resolve({
          ...mockNft,
          ...updatedNft
        } as unknown as NftDto),
      remove: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftController],
      providers: [
        {
          provide: NftService,
          useValue: service
        },
        {
          provide: NftCollectionService,
          useValue: nftCollectionService
        }
      ]
    }).compile()

    controller = module.get<NftController>(NftController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should create a nft', async () => {
    const result = await controller.create(mockCreateNft)
    expect(result.id).toBe(mockCreateNftResponse.id)
  })

  it('should fetch all nfts', async () => {
    const result = await controller.findAll({} as Request, {
      query: [{ $skip: 0 }, { $limit: 10 }]
    })
    expect(result).toEqual([])
  })

  it('should fetch a nft', async () => {
    const result = await controller.findOne('123')
    expect(result.metadata).toBe(mockNft.metadata)
  })

  it('should update a nft', async () => {
    const result = await controller.update(mockCreateNftResponse.id, {
      userId: '123' as unknown as ObjectID
    } as UpdateNftDto)

    expect(result).toEqual({
      ...mockNft,
      userId: '123'
    })
  })

  it('should delete a nft', async () => {
    await controller.remove('123')
    expect(service.remove).toHaveBeenCalledWith('123')
  })
})
