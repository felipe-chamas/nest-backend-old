import { NftCollection } from '../../nft-collection/entities/nft-collection.entity';
import { User } from '../../user/entities/user.entity';

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  ObjectID,
  ObjectIdColumn,
  OneToOne,
} from 'typeorm';
import { Metadata } from '../interface';

@Entity()
@Index(['tokenId', 'userId', 'nftCollectionId'])
export class Nft {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  @Index({ unique: true })
  tokenId: string;

  @Column()
  metadata: Metadata;

  @Column()
  @Index({ unique: true })
  userId?: string;

  @Column({ unique: true })
  nftCollectionId?: string;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;

  @ManyToOne(() => NftCollection, (nftCollection) => nftCollection.id)
  @JoinColumn()
  nftCollection: NftCollection;
}
