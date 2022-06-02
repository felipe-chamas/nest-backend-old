import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { IsAssetIdArray } from 'common/decorators';
import { User } from 'common/entities';
import { NftCollection } from 'common/entities/nft-collection.entity';
import { AssetIdDto } from 'common/types';

import { Metadata } from '../interface';

export class UpdateNftDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  nftCollectionId?: NftCollection['id'];

  @ApiProperty()
  @IsOptional()
  @IsString()
  userId?: User['id'];

  @ApiProperty()
  @IsOptional()
  @IsAssetIdArray
  assetIds?: AssetIdDto[];

  @ApiProperty()
  @IsOptional()
  @IsObject()
  metadata?: Metadata;
}
