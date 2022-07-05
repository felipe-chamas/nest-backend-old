import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsAssetTypeArray } from 'common/decorators';
import { AssetTypeDto } from 'common/types';

export class CreateNftCollectionDto {
  @ApiProperty({
    description: 'Nft collection name.',
    example: 'CryptoKitties',
  })
  name: string;

  @ApiProperty({
    type: () => [Object],
    description: [
      'Asset types.',
      'Corresponds to where this collection is deployed on the blockchain, with `chainId` and `assetName` references.',
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
      },
    ],
  })
  @IsAssetTypeArray
  assetTypes: AssetTypeDto[];

  @ApiProperty({
    description: 'Image base URI for Nfts belonging to this Nft collection.',
    example: 'https://example.com/cryptokitties/image/',
  })
  imageBaseUri?: string;

  @ApiProperty({
    description:
      'External URL. Redirects to more details about the Nft collection.',
    example: 'https://example.com/cryptokitties/',
  })
  externalUrl?: string;

  @ApiProperty({
    description: 'Nft collection icon.',
    example: 'https://example.com/image.png',
  })
  icon?: string;
}
