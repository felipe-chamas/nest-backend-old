import { ApiProperty } from '@nestjs/swagger';
import { IsAssetIdArray } from 'common/decorators';
import { AssetIdDto } from 'common/types';
import { Metadata } from '../interface';

export class CreateNftDto {
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
  metadata: Metadata;

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
  assetIds: AssetIdDto[];

  @ApiProperty({
    type: () => String,
    example: '507f1f77bcf86cd799439011',
    description: 'User id.',
  })
  userId?: string;

  @ApiProperty({
    type: () => String,
    example: '507f1f77bcf86cd799439011',
    description: 'Nft collection id.',
  })
  nftCollectionId: string;
}
