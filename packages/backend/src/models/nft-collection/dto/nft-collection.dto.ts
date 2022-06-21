import { ApiProperty } from '@nestjs/swagger';
import { AssetTypeDto } from 'common/types';

export class NftCollectionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  assetTypes: AssetTypeDto[];

  @ApiProperty()
  slug: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  tx?: string;

  @ApiProperty()
  imageBaseUri?: string;

  @ApiProperty()
  externalUrl?: string;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}
