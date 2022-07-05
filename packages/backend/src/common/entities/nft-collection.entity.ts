import { Nft } from './nft.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ObjectID,
  ObjectIdColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

import slugify from 'slugify';
import { AssetTypeDto } from 'common/types';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class NftCollection {
  @ObjectIdColumn()
  @ApiProperty({
    type: () => String,
    description: 'Nft collection id.',
    example: '507f1f77bcf86cd799439011',
  })
  id: ObjectID;

  @Column()
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
  assetTypes: AssetTypeDto[];

  @Column()
  @ApiProperty({
    description: [
      'Nft collection slug.',
      'Uniquely user-friendly name intended to identify the Nft collection.',
    ].join('<br/>'),
    example: 'cryptokitties',
  })
  slug: string;

  @Column()
  @ApiProperty({
    description: 'Nft collection name.',
    example: 'CryptoKitties',
  })
  name: string;

  @Column()
  @ApiProperty({
    description: 'Nft collection icon.',
    example: 'https://example.com/image.png',
  })
  icon: string;

  @Column()
  @ApiProperty({
    description: 'Image base URI for Nfts belonging to this Nft collection.',
    example: 'https://example.com/cryptokitties/image/',
  })
  imageBaseUri: string;

  @Column()
  @ApiProperty({
    description:
      'External URL. Redirects to more details about the Nft collection.',
    example: 'https://example.com/cryptokitties/',
  })
  externalUrl: string;

  @OneToMany(() => Nft, (nft) => nft.nftCollectionId)
  @ApiProperty({
    description: 'List of Nfts from this Nft collection',
  })
  nfts: Nft[];

  @CreateDateColumn()
  @ApiProperty({
    description: 'Created date (automatically set).',
    type: () => String,
    example: '2022-07-05T14:12:34.567Z',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'Updated date (automatically set).',
    type: () => String,
    example: '2022-07-06T14:12:34.567Z',
  })
  updatedAt: Date;

  @DeleteDateColumn()
  @ApiProperty({
    description: 'Deleted date (automatically set).',
    type: () => String,
    example: '2022-07-07T14:12:34.567Z',
  })
  deletedAt: Date;

  @BeforeInsert()
  beforeSave() {
    this.slug = slugify(this.name, { lower: true });
  }
}
