import { CreateNftCollectionDto } from '@common/dto/create-nft-collection.dto'
import { NftCollectionDto } from '@common/dto/entities/nft-collection.dto'

export const mockNftCollection = {
  id: '624b40189c5293c6f75945f1',
  name: '#nftCode',
  nfts: []
} as unknown as NftCollectionDto

export const mockCreateNftCollection = {
  id: '624b40189c5293c6f75945f1',
  name: '#nftCode'
} as unknown as CreateNftCollectionDto
