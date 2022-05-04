import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { User } from 'common/entities';
import { NftCollection } from 'common/entities/nft-collection.entity';

import { Metadata } from '../interface';

export class UpdateNftDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  nftCollectionId: NftCollection['id'];

  @ApiProperty()
  @IsOptional()
  @IsString()
  userId: User['id'];

  @ApiProperty()
  @IsOptional()
  @IsObject()
  metadata: Metadata;
}
