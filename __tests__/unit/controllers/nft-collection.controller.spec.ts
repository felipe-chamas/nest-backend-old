import { Test, TestingModule } from '@nestjs/testing'
import { Request } from 'express'
import { ObjectID } from 'typeorm'

import { CreateNftCollectionDto } from '@common/dto/create-nft-collection.dto'
import { NftCollection } from '@common/dto/entities/nft-collection.entity'
import { NftCollectionController } from '@controllers/nft-collection.controller'
import { NftCollectionService } from '@services/nft-collection.service'
import { mockCreateNftCollection, mockNftCollection } from '__mocks__/nft-collection.mock'

describe('NftCollectionController', () => {
  let controller: NftCollectionController
  let service: Partial<NftCollectionService>

  beforeEach(async () => {
    service = {
      create: (createNftCollectionDto: CreateNftCollectionDto) =>
        Promise.resolve({
          ...mockNftCollection,
          ...createNftCollectionDto
        } as unknown as NftCollection),
      findAll: () =>
        Promise.resolve({
          data: [mockNftCollection as NftCollection],
          total: 1
        }),
      findById: jest.fn().mockImplementation(async () => {
        return {
          ...mockNftCollection,
          id: '123' as unknown as ObjectID
        } as unknown as NftCollection
      }),
      update: jest.fn().mockImplementation(async () =>
        Promise.resolve({
          ...mockNftCollection
        })
      ),
      remove: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftCollectionController],
      providers: [
        {
          provide: NftCollectionService,
          useValue: service
        }
      ]
    }).compile()

    controller = module.get<NftCollectionController>(NftCollectionController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should create and nftCollection', async () => {
    const result = await controller.create(mockCreateNftCollection)

    expect(result).toEqual({ ...mockCreateNftCollection, ...result })
  })

  it('should fetch all nftCollections', async () => {
    const result = await controller.findAll({} as Request, {
      query: [{ $skip: 0 }, { $limit: 10 }]
    })
    expect(result).toEqual({ data: [mockNftCollection], total: 1 })
  })

  it('should fetch a nftCollection', async () => {
    const id = mockNftCollection.id as unknown as string
    const result = await controller.findOne(id)
    expect(result.name).toEqual(mockNftCollection.name)
  })

  it('should update a nftCollection', async () => {
    const id = mockNftCollection.id as unknown as string
    const result = await controller.update(id, {
      name: mockNftCollection.name
    })

    expect(result.name).toEqual(mockNftCollection.name)
  })

  it('should delete a nftCollection', async () => {
    const id = mockNftCollection.id as unknown as string
    await controller.remove(id)
    expect(service.remove).toHaveBeenCalledWith(mockNftCollection.id)
  })
})
