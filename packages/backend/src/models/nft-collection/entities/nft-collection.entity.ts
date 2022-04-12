import { Nft } from 'models/nft/entities/nft.entity';
import {
  Column,
  Entity,
  Index,
  ObjectID,
  ObjectIdColumn,
  OneToMany,
} from 'typeorm';

@Entity()
@Index(['contractAddress', 'tx'])
export class NftCollection {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  name: string;

  @Column()
  @Index()
  contractAddress?: string;

  @Column()
  @Index()
  tx?: string;

  @OneToMany(() => Nft, (nft) => nft.nftCollectionId)
  nfts: Nft[];
}
