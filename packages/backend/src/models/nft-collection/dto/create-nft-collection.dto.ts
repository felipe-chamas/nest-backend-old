import { IsAssetTypeArray } from 'common/decorators';
import {
  ApiPropertyAssetTypes,
  ApiPropertyNftCollectionExternalUrl,
  ApiPropertyNftCollectionIcon,
  ApiPropertyNftCollectionImageBaseUri,
  ApiPropertyNftCollectionName,
} from 'common/decorators/docs.decorators';
import { AssetTypeDto } from 'common/types';

export class CreateNftCollectionDto {
  @ApiPropertyNftCollectionName()
  name: string;

  @ApiPropertyAssetTypes()
  @IsAssetTypeArray
  assetTypes: AssetTypeDto[];

  @ApiPropertyNftCollectionImageBaseUri()
  imageBaseUri?: string;

  @ApiPropertyNftCollectionExternalUrl()
  externalUrl?: string;

  @ApiPropertyNftCollectionIcon()
  icon?: string;
}
