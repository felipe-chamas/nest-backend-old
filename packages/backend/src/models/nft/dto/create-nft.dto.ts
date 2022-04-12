import { IsOptional, IsString } from 'class-validator';
import { Metadata } from '../interface';

export class CreateNftDto {
  @IsString()
  metadata: Metadata;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  tokenId: string;

  @IsString()
  nftCollectionId: string;
}
