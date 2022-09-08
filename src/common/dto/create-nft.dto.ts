import { IsAssetIdArray } from '@common/decorators/caip.decorators'
import { ApiPropertyAssetIds, ApiPropertyMetadata } from '@common/decorators/docs.decorators'

import type { AssetIdDto } from '@common/types/caip'
import type { Metadata } from '@common/types/metadata'

export class CreateNftDto {
  @ApiPropertyMetadata()
  metadata: Metadata

  @IsAssetIdArray
  @ApiPropertyAssetIds()
  assetIds: AssetIdDto[]
}
