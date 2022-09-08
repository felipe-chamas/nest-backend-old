import { NftDocument } from '@common/schemas/nft.schema'

const mockMetadata = {
  name: 'starfish',
  image: 'https://example.com',
  description: 'Starfish from the sea',
  attributes: [
    {
      trait_type: 'name',
      value: 'starfish'
    },
    {
      trait_type: 'eyes',
      value: 'big'
    }
  ]
}

const mockAssetIds = [
  {
    chainId: {
      namespace: 'eip155',
      reference: '56'
    },
    assetName: {
      namespace: 'ERC721',
      reference: '0xE9f9245615A4571d322fe6EA03Ab82C44b432CEa'
    },
    tokenId: '1'
  }
]

export const mockNft: Partial<NftDocument> = {
  _id: '624b466796780a1276e70e53',
  metadata: mockMetadata,
  assetIds: mockAssetIds
}
