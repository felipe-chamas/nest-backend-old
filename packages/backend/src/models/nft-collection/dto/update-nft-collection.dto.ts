import { IsOptional } from 'class-validator';
import { IsAssetTypeArray } from 'common/decorators';
import {
  ApiPropertyAssetTypes,
  ApiPropertyNftCollectionExternalUrl,
  ApiPropertyNftCollectionIcon,
  ApiPropertyNftCollectionImageBaseUri,
  ApiPropertyNftCollectionName,
} from 'common/decorators/docs.decorators';
import { AssetTypeDto } from 'common/types';

export class UpdateNftCollectionDto {
  @ApiPropertyNftCollectionName()
  @IsOptional()
  name?: string;

  @ApiPropertyAssetTypes()
  @IsAssetTypeArray
  @IsOptional()
  assetTypes?: AssetTypeDto[];

  @ApiPropertyNftCollectionImageBaseUri()
  @IsOptional()
  imageBaseUri?: string;

  @ApiPropertyNftCollectionExternalUrl()
  @IsOptional()
  externalUrl?: string;

  @ApiPropertyNftCollectionIcon()
  @IsOptional()
  icon?: string;
}
