import { IsObject, IsOptional } from 'class-validator';
import { IsAssetIdArray } from 'common/decorators';
import { User } from 'common/entities';
import { NftCollection } from 'common/entities/nft-collection.entity';
import { AssetIdDto } from 'common/types';

import { Metadata } from '../interface';

import {
  ApiPropertyAssetIds,
  ApiPropertyMetadata,
  ApiPropertyNftCollectionId,
  ApiPropertyUserId,
} from 'common/decorators/docs.decorators';

export class UpdateNftDto {
  @ApiPropertyNftCollectionId()
  @IsOptional()
  nftCollectionId?: NftCollection['id'];

  @ApiPropertyUserId()
  @IsOptional()
  userId?: User['id'];

  @IsAssetIdArray
  @ApiPropertyAssetIds()
  @IsOptional()
  assetIds?: AssetIdDto[];

  @IsObject()
  @ApiPropertyMetadata()
  @IsOptional()
  metadata?: Metadata;
}
