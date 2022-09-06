import { IsObject, IsOptional } from 'class-validator'

import { IsAssetIdArray } from '@common/decorators/caip.decorators'
import {
  ApiPropertyAssetIds,
  ApiPropertyMetadata,
  ApiPropertyNftCollectionId,
  ApiPropertyUserId
} from '@common/decorators/docs.decorators'
import { NftCollectionDto } from '@common/dto/entities/nft-collection.dto'
import { UserDto } from '@common/dto/entities/user.dto'

import type { AssetIdDto } from '@common/types/caip'
import type { Metadata } from '@common/types/metadata'

export class UpdateNftDto {
  @ApiPropertyNftCollectionId()
  @IsOptional()
  nftCollectionId?: NftCollectionDto['id']

  @ApiPropertyUserId()
  @IsOptional()
  userId?: UserDto['id']

  @IsAssetIdArray
  @ApiPropertyAssetIds()
  @IsOptional()
  assetIds?: AssetIdDto[]

  @IsObject()
  @ApiPropertyMetadata()
  @IsOptional()
  metadata?: Metadata
}
