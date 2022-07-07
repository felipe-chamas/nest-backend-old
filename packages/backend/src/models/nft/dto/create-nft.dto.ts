import { IsAssetIdArray } from 'common/decorators';
import { AssetIdDto } from 'common/types';
import { Metadata } from '../interface';
import {
  ApiPropertyAssetIds,
  ApiPropertyMetadata,
  ApiPropertyNftCollectionId,
  ApiPropertyUserId,
} from 'common/decorators/docs.decorators';

export class CreateNftDto {
  @ApiPropertyMetadata()
  metadata: Metadata;

  @IsAssetIdArray
  @ApiPropertyAssetIds()
  assetIds: AssetIdDto[];

  @ApiPropertyUserId()
  userId?: string;

  @ApiPropertyNftCollectionId()
  nftCollectionId: string;
}
