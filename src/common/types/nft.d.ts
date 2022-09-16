import type { AssetIdDto } from './caip'
import type { Metadata } from './metadata'

export interface Nft {
  assetId: AssetIdDto
  tokenUri: string
  metadata: Metadata
}
