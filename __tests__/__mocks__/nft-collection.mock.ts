import { NftCollectionDocument } from '@common/schemas/nft-collection.schema'

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

export const nftCollectionModelMockFactory = jest.fn().mockImplementation(() => ({
  findById: mockWithMongooseMethodChaining(mockNftCollection),
  findByIdAndUpdate: mockWithMongooseMethodChaining(mockNftCollection),
  find: mockWithMongooseMethodChaining([mockNftCollection, mockNftCollection]),
  deleteById: mockWithMongooseMethodChaining(undefined),
  save: jest.fn().mockReturnValue(mockNftCollection)
}))
