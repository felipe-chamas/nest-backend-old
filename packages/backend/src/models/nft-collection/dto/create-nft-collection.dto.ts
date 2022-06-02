import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsAssetTypeArray } from 'common/decorators';
import { AssetTypeDto } from 'common/types';

export class CreateNftCollectionDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsAssetTypeArray
  assetTypes: AssetTypeDto[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  tx?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  imageBaseUri?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  externalUrl?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  icon?: string;
}
