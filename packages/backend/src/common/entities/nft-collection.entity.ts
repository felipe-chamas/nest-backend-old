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
import {
  ApiPropertyAssetTypes,
  ApiPropertyCreatedAt,
  ApiPropertyDeletedAt,
  ApiPropertyNftCollectionExternalUrl,
  ApiPropertyNftCollectionIcon,
  ApiPropertyNftCollectionId,
  ApiPropertyNftCollectionImageBaseUri,
  ApiPropertyNftCollectionName,
  ApiPropertyNftCollectionSlug,
  ApiPropertyNftCollectionNfts,
  ApiPropertyUpdatedAt,
} from 'common/decorators/docs.decorators';

@Entity()
export class NftCollection {
  @ObjectIdColumn()
  @ApiPropertyNftCollectionId()
  id: ObjectID;

  @Column()
  @ApiPropertyAssetTypes()
  assetTypes: AssetTypeDto[];

  @Column()
  @ApiPropertyNftCollectionSlug()
  slug: string;

  @Column()
  @ApiPropertyNftCollectionName()
  name: string;

  @Column()
  @ApiPropertyNftCollectionIcon()
  icon: string;

  @Column()
  @ApiPropertyNftCollectionImageBaseUri()
  imageBaseUri: string;

  @Column()
  @ApiPropertyNftCollectionExternalUrl()
  externalUrl: string;

  @OneToMany(() => Nft, (nft) => nft.nftCollectionId)
  @ApiPropertyNftCollectionNfts()
  nfts: Nft[];

  @CreateDateColumn()
  @ApiPropertyCreatedAt()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiPropertyUpdatedAt()
  updatedAt: Date;

  @DeleteDateColumn()
  @ApiPropertyDeletedAt()
  deletedAt: Date;

  @BeforeInsert()
  beforeSave() {
    this.slug = slugify(this.name, { lower: true });
  }
}
