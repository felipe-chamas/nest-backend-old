import { ApiProperty } from '@nestjs/swagger';
import { AssetIdDto } from 'common/types';
import { Metadata } from '../interface';

export class NftDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  assetIds: AssetIdDto[];

  @ApiProperty()
  metadata: Metadata;

  @ApiProperty()
  userId?: string;

  @ApiProperty()
  nftCollectionId: string;
}
