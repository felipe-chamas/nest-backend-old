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

@Entity()
export class NftCollection {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  AssetTypes: AssetTypeDto[];

  @Column()
  slug: string;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column()
  imageBaseUri: string;

  @Column()
  externalUrl: string;

  @OneToMany(() => Nft, (nft) => nft.nftCollectionId)
  nfts: Nft[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  beforeSave() {
    this.slug = slugify(this.name);
  }
}
