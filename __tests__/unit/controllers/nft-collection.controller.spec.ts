import { Test, TestingModule } from '@nestjs/testing'
import { Request } from 'express'

import { NftCollectionController } from '@controllers/nft-collection.controller'
import { NftCollectionService } from '@services/nft-collection.service'
import { mockNftCollection, mockNftCollectionService } from '__mocks__/nft-collection.mock'

describe('NftCollectionController', () => {
  let controller: NftCollectionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftCollectionController],
      providers: [
        {
          provide: NftCollectionService,
          useValue: mockNftCollectionService
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
    expect(mockNftCollectionService.remove).toHaveBeenCalledWith(mockNftCollection.id)
  })
})
