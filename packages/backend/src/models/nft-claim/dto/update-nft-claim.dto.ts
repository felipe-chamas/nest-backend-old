import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import { ObjectID } from 'typeorm';
import { Metadata } from '../../../models/nft/interface';

export class UpdateNftClaimDto {
  @ApiProperty()
  @IsString()
  merkleRoot: string;

  @ApiProperty()
  @IsObject()
  merkleProofs: Record<string, { tokens: string; proof: string[] }>;

  @ApiProperty()
  @IsObject()
  metadata: Metadata;

  @ApiProperty()
  @IsString()
  nftCollectionId: ObjectID;
}
