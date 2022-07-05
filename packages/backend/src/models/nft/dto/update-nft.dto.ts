import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';
import { IsAssetIdArray } from 'common/decorators';
import { User } from 'common/entities';
import { NftCollection } from 'common/entities/nft-collection.entity';
import { AssetIdDto } from 'common/types';

import { Metadata } from '../interface';

export class UpdateNftDto {
  @ApiProperty({
    type: () => String,
    example: '507f1f77bcf86cd799439011',
    description: 'Nft collection id.',
  })
  nftCollectionId?: NftCollection['id'];

  @ApiProperty({
    type: () => String,
    example: '507f1f77bcf86cd799439011',
    description: 'User id.',
  })
  userId?: User['id'];

  @IsAssetIdArray
  @ApiProperty({
    description: [
      'Asset Id array representing the `tokenId`s minted on the blockchain.',
      'This array can have more than one element in the case of the Nft being deployed on multiple chains.',
    ].join('<br/>'),
    example: [
      {
        chainId: {
          namespace: 'solana',
          reference: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
        },
        assetName: {
          namespace: 'NonFungible',
          reference: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        },
        tokenId: '2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9',
      },
    ],
  })
  assetIds?: AssetIdDto[];

  @IsObject()
  @ApiProperty({
    description: 'Nft metadata',
    example: {
      name: 'Game item.',
      description: 'Description about the game item.',
      image: 'https://example.com/image.png',
      attributes: [
        {
          trait_type: 'Rarity',
          value: 'Legendary',
        },
      ],
    },
  })
  metadata?: Metadata;
}
