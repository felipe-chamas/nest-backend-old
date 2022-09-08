import { Test, TestingModule } from '@nestjs/testing'
import { Request } from 'express'
import { ObjectId } from 'mongoose'

import { CreateNftDto } from '@common/dto/create-nft.dto'
import { UpdateNftDto } from '@common/dto/update-nft.dto'
import { NftDocument } from '@common/schemas/nft.schema'
import { NftController } from '@controllers/nft.controller'
import { NftCollectionService } from '@services/nft-collection.service'
import { NftService } from '@services/nft.service'
import { mockNft } from '__mocks__/nft.mock'
import { mockUser } from '__mocks__/user.mock'

type NftResult = NftDocument & { _id: ObjectId }

describe('NftController', () => {
  let controller: NftController
  let service: Partial<NftService>
  const nftCollectionService = NftCollectionService.prototype

  beforeEach(async () => {
    service = {
      create: (createNftDto: CreateNftDto) =>
        Promise.resolve({
          ...mockNft,
          ...createNftDto
        } as NftResult),
      findAll: () => Promise.resolve({ total: 0, data: [] }),
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
        } as NftResult),
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
    const result = await controller.create({
      metadata: mockNft.metadata,
      assetIds: mockNft.assetIds
    })
    expect(result._id).toBe(mockNft._id)
  })

  it('should fetch all nfts', async () => {
    const result = await controller.findAll({} as Request, {
      skip: 0,
      limit: 10,
      sort: {}
    })
    expect(result).toEqual({ data: [], total: 0 })
  })

  it('should fetch a nft', async () => {
    const result = await controller.findOne('123')
    expect(result.metadata).toBe(mockNft.metadata)
  })

  it('should update a nft', async () => {
    const result = await controller.update(mockNft._id, {
      metadata: {
        ...mockNft.metadata,
        description: 'New Description'
      }
    } as UpdateNftDto)

    expect(result).toEqual({
      ...mockNft,
      metadata: {
        ...mockNft.metadata,
        description: 'New Description'
      }
    })
  })

  it('should delete a nft', async () => {
    await controller.remove('123')
    expect(service.remove).toHaveBeenCalledWith('123')
  })
})
