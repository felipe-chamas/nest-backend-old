import { Nft } from './nft.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ObjectID,
  ObjectIdColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { AccountIdDto } from 'common/types';
import { Role } from '../enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['email'])
export class User {
  @ObjectIdColumn()
  @ApiProperty({
    type: () => String,
    example: '507f1f77bcf86cd799439011',
    description: 'User id.',
  })
  id: ObjectID;

  @Column()
  @ApiProperty({
    description: 'User name.',
    example: 'Vitalik Buterin',
  })
  name?: string;

  @Column()
  @ApiProperty({
    example: 'vitalik@ethereum.org',
    description: 'User email.',
  })
  email?: string;

  @Column()
  @ApiProperty({
    enum: Role,
    description: [
      'User roles.',
      'By default, user is not allowed to interact with anything other than their own profile information.',
    ].join('<br/>'),
    example: ['NFT_ADMIN'],
  })
  roles: Role[];

  @Column()
  @ApiProperty({
    description: [
      'User acount ids.',
      'List of accounts (wallets) the user has connected to the platform. This list may include accounts in many different networks.',
      'There is no "master" account, all accounts have the same privileges with regard to user permissions.',
    ].join('<br/>'),
    example: [
      {
        chainId: {
          namespace: 'solana',
          reference: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
        },
        address: '2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9',
      },
    ],
  })
  accountIds: AccountIdDto[];

  @Column()
  @ApiProperty({
    type: () => Object,
    description: [
      'Discord information.',
      'This property is only present on users that have connected their discord account.',
    ].join('<br/>'),
    example: { id: '364990825698837451', username: 'vitalik#1234' },
  })
  discord?: {
    id: string;
    username: string;
  };

  @Column()
  @ApiProperty({
    description: 'Avatar URL.',
    example: 'https://example.com/image.png',
  })
  avatarUrl?: string;

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

  @OneToMany(() => Nft, (nft) => nft.user)
  @ApiProperty({
    description: 'List of user Nfts',
  })
  nfts: Nft[];
}
