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

@Entity()
@Index(['userId', 'nftCollectionId'])
export class Nft {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  assetIds: AssetIdDto[];

  @Column()
  metadata: Metadata;

  @Column()
  @Index()
  userId?: User['id'];

  @Column()
  nftCollectionId?: NftCollection['id'];

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;

  @ManyToOne(() => NftCollection, (nftCollection) => nftCollection.id)
  @JoinColumn()
  nftCollection: NftCollection;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
