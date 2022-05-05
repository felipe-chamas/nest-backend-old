import { NftCollection } from './nft-collection.entity';
import { User } from './user.entity';

import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  ObjectID,
  ObjectIdColumn,
} from 'typeorm';
import { Metadata } from '../../models/nft/interface';

@Entity()
@Index(['userId', 'nftCollectionId'])
export class Nft {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  tokenId: string;

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

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @BeforeInsert()
  expire() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  update() {
    this.updatedAt = new Date();
  }
}
