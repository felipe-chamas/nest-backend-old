import { IsObject, IsOptional, IsString } from 'class-validator';
import { Metadata } from '../interface';

export class UpdateNftDto {
  @IsOptional()
  @IsString()
  nftCollectionId: string;

  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsObject()
  metadata: Metadata;
}
