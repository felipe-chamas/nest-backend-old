import { NftCollection } from './nft-collection.entity';
import { User } from './user.entity';

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Metadata } from '../../models/nft/interface';
import { AssetIdDto } from 'common/types';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['userId', 'nftCollectionId'])
export class Nft {
  @ObjectIdColumn()
  @ApiProperty({
    type: () => String,
    example: '507f1f77bcf86cd799439011',
    description:
      'Nft id. This is not the same as the `tokenId` represented on the blockchain smart contract.',
  })
  id: ObjectID;

  @Column()
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

  @Column()
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

  @Column()
  @Index()
  @ApiProperty({
    type: () => String,
    description: 'User id.',
    example: '507f1f77bcf86cd799439011',
  })
  userId?: User['id'];

  @Column()
  @ApiProperty({
    type: () => String,
    description: 'Nft collection id.',
    example: '507f1f77bcf86cd799439011',
  })
  nftCollectionId: NftCollection['id'];

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;

  @ManyToOne(() => NftCollection, (nftCollection) => nftCollection.id)
  @JoinColumn()
  nftCollection: NftCollection;

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
}
