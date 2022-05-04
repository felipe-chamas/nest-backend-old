import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { ObjectID } from 'typeorm';
import { Metadata } from '../interface';

export class CreateNftDto {
  @ApiProperty()
  @IsObject()
  metadata: Metadata;

  @ApiProperty()
  @IsOptional()
  @IsString()
  userId?: ObjectID;

  @ApiProperty()
  @IsOptional()
  @IsString()
  tokenId: string;

  @ApiProperty()
  @IsString()
  nftCollectionId: ObjectID;
}
