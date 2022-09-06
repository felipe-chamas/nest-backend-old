import { NftCollection } from '@common/dto/entities/nft-collection.entity'

export interface NftCollectionFacet {
  data: NftCollection[]
  total: number
}
