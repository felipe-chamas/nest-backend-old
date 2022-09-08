import { IsObject, IsOptional } from 'class-validator'

import { IsAssetIdArray } from '@common/decorators/caip.decorators'
import { ApiPropertyAssetIds, ApiPropertyMetadata } from '@common/decorators/docs.decorators'

import type { AssetIdDto } from '@common/types/caip'
import type { Metadata } from '@common/types/metadata'

export class UpdateNftDto {
  @IsAssetIdArray
  @ApiPropertyAssetIds()
  @IsOptional()
  assetIds?: AssetIdDto[]

  @IsObject()
  @ApiPropertyMetadata()
  @IsOptional()
  metadata?: Metadata
}
