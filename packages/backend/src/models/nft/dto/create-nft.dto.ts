import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { IsAssetIdArray } from 'common/decorators';
import { AssetIdDto } from 'common/types';
import { ObjectID } from 'typeorm';
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
  userId?: ObjectID;

  @ApiProperty()
  @IsString()
  nftCollectionId: ObjectID;
}
