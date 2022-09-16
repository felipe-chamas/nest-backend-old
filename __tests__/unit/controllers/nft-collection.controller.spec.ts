import { Test, TestingModule } from '@nestjs/testing'
import { Request } from 'express'
import { ObjectId } from 'mongoose'

import { NftCollectionDocument, NftCollectionDto } from '@common/schemas/nft-collection.schema'
import { NftCollectionController } from '@controllers/nft-collection.controller'
import { NftCollectionService } from '@services/nft-collection.service'
import { mockNftCollection } from '__mocks__/nft-collection.mock'

type NftCollectionResult = NftCollectionDocument & { _id: ObjectId }

describe('NftCollectionController', () => {
  let controller: NftCollectionController
  let service: Partial<NftCollectionService>

  beforeEach(async () => {
    service = {
      create: (createNftCollectionDto: Partial<NftCollectionDto>) =>
        Promise.resolve({
          ...mockNftCollection,
          ...createNftCollectionDto
        } as NftCollectionResult),
      findAll: () =>
        Promise.resolve({
          data: [mockNftCollection as NftCollectionResult],
          total: 1
        }),
      findById: jest.fn().mockImplementation(async () => {
        return {
          ...mockNftCollection,
          id: '123'
        } as unknown as NftCollectionDto
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

  it('should fetch all nftCollections', async () => {
    const result = await controller.findAll({} as Request, {
      skip: 0,
      limit: 10,
      sort: {}
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
