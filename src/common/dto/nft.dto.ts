import {
  ApiPropertyAssetId,
  ApiPropertyMetadata,
  ApiPropertyTokenUri
} from '@common/decorators/docs.decorators'
import { Metadata } from '@common/types/metadata'

import type { AssetIdDto } from '@common/types/caip'

export class NftDto {
  @ApiPropertyAssetId()
  assetId: AssetIdDto

  @ApiPropertyTokenUri()
  tokenUri: string

  @ApiPropertyMetadata()
  metadata: Metadata
}
