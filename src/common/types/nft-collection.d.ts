import { NftCollectionDto } from '@common/dto/entities/nft-collection.dto'

export interface NftCollectionFacet {
  data: NftCollectionDto[]
  total: number
}
