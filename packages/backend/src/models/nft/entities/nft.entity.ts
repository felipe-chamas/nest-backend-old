import { NftCollection } from 'models/nft-collection/entities/nft-collection.entity';
import { User } from 'models/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  ObjectIdColumn,
  OneToOne,
} from 'typeorm';

@Entity()
export class Nft {
  @ObjectIdColumn()
  id: string;

  @Column()
  properties: Record<string, string>;

  @Column()
  userId?: string;

  @Column()
  nftCollectionId?: string;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;

  @ManyToOne(() => NftCollection, (nftCollection) => nftCollection.id)
  @JoinColumn()
  nftCollection: NftCollection;
}
