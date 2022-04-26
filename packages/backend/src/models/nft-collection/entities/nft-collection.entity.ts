import { Nft } from '../../nft/entities/nft.entity';
import {
  Column,
  Entity,
  Index,
  ObjectID,
  ObjectIdColumn,
  OneToMany,
} from 'typeorm';

@Entity()
@Index(['contractAddress'])
export class NftCollection {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  slug: string;

  @Column()
  name: string;

  @Column()
  imageBaseUri: string;

  @Column()
  externalUrl: string;

  @Column()
  @Index()
  contractAddress?: string;

  @OneToMany(() => Nft, (nft) => nft.nftCollectionId)
  nfts: Nft[];
}
