import { Nft } from './../../nft/entities/nft.entity';
import { Column, Entity, ObjectIdColumn, OneToMany } from 'typeorm';

@Entity()
export class NftCollection {
  @ObjectIdColumn()
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Nft, (nft) => nft.nftCollectionId, { eager: true })
  nfts: Nft[];
}
