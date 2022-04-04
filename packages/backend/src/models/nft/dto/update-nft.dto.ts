import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateNftDto {
  @IsOptional()
  @IsString()
  nftCollectionId: string;

  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsObject()
  properties: Record<string, string>;
}
