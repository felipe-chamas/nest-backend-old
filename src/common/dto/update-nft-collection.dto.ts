import { IsOptional } from 'class-validator'

import { IsAssetTypeArray } from '@common/decorators/caip.decorators'
import {
  ApiPropertyAssetTypes,
  ApiPropertyNftCollectionExternalUrl,
  ApiPropertyNftCollectionIcon,
  ApiPropertyNftCollectionName
} from '@common/decorators/docs.decorators'

import type { AssetTypeDto } from '@common/types/caip'

export class UpdateNftCollectionDto {
  @ApiPropertyNftCollectionName()
  @IsOptional()
  name?: string

  @ApiPropertyAssetTypes()
  @IsAssetTypeArray
  @IsOptional()
  assetTypes?: AssetTypeDto[]

  @ApiPropertyNftCollectionExternalUrl()
  @IsOptional()
  externalUrl?: string

  @ApiPropertyNftCollectionIcon()
  @IsOptional()
  icon?: string
}
