import { IsAssetTypeArray } from '@common/decorators/caip.decorators'
import {
  ApiPropertyAssetTypes,
  ApiPropertyNftCollectionExternalUrl,
  ApiPropertyNftCollectionIcon,
  ApiPropertyNftCollectionName
} from '@common/decorators/docs.decorators'

import type { AssetTypeDto } from '@common/types/caip'

export class CreateNftCollectionDto {
  @ApiPropertyNftCollectionName()
  name: string

  @ApiPropertyAssetTypes()
  @IsAssetTypeArray
  assetTypes: AssetTypeDto[]

  @ApiPropertyNftCollectionExternalUrl()
  externalUrl?: string

  @ApiPropertyNftCollectionIcon()
  icon?: string
}
