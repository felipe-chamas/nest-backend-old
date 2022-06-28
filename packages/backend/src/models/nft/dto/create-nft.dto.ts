import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { IsAssetIdArray } from 'common/decorators';
import { AssetIdDto } from 'common/types';
import { Metadata } from '../interface';

export class CreateNftDto {
  @ApiProperty()
  @IsObject()
  metadata: Metadata;

  @ApiProperty()
  @IsAssetIdArray
  assetIds: AssetIdDto[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty()
  @IsString()
  nftCollectionId: string;
}
