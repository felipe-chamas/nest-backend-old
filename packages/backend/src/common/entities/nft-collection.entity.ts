import { Nft } from './nft.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ObjectID,
  ObjectIdColumn,
  OneToMany,
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

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @BeforeInsert()
  beforeSave() {
    this.slug = slugify(this.name);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  update() {
    this.updatedAt = new Date();
  }
}
