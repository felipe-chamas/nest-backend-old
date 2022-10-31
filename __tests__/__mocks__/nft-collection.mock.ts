import { AssetType } from 'caip'
import { ObjectId } from 'mongoose'

import { NftCollectionDocument, NftCollectionDto } from '@common/schemas/nft-collection.schema'
import { NftCollectionService } from '@services/nft-collection.service'

import { mockWithMongooseMethodChaining } from './utils'

export const mockNftCollection: Partial<NftCollectionDocument> = {
  _id: '624b40189c5293c6f75945f1',
  name: '#nftCode',
  assetTypes: [
    {
      chainId: {
        namespace: 'eip155',
        reference: '56'
      },
      assetName: {
        namespace: 'ERC721',
        reference: '0xE9f9245615A4571d322fe6EA03Ab82C44b432CEa'
      }
    }
  ]
}

type NftCollectionResult = NftCollectionDocument & { _id: ObjectId }

export const mockNftCollectionService: Partial<NftCollectionService> = {
  create: jest.fn().mockImplementation((createNftCollectionDto: Partial<NftCollectionDto>) =>
    Promise.resolve({
      ...mockNftCollection,
      ...createNftCollectionDto
    } as NftCollectionResult)
  ),
  findAll: jest.fn().mockImplementation(() =>
    Promise.resolve({
      data: [mockNftCollection as NftCollectionResult],
      total: 1
    })
  ),

  findAddressesByChainId: jest.fn().mockImplementation(async () => {
    return [mockNftCollection.assetTypes[0].assetName.reference]
  }),
  findByAssetType: jest.fn().mockImplementation(async (assetType: AssetType) => {
    const result = { ...mockNftCollection, assetType }
    return result
  }),
  findById: jest.fn().mockImplementation(async (id: string) => {
    return {
      ...mockNftCollection,
      _id: id
    }
  }),
  update: jest.fn().mockImplementation(async (id: string, update: Partial<NftCollectionDto>) =>
    Promise.resolve({
      ...mockNftCollection,
      ...update,
      _id: id
    })
  ),

  remove: jest.fn()
}

export const nftCollectionModelMockFactory = jest.fn().mockImplementation(() => ({
  findById: mockWithMongooseMethodChaining(mockNftCollection),
  findByIdAndUpdate: mockWithMongooseMethodChaining(mockNftCollection),
  find: mockWithMongooseMethodChaining([mockNftCollection, mockNftCollection]),
  deleteById: mockWithMongooseMethodChaining(undefined),
  save: jest.fn().mockReturnValue(mockNftCollection)
}))
