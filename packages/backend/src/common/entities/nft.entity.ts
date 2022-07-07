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
import {
  ApiPropertyAssetIds,
  ApiPropertyCreatedAt,
  ApiPropertyDeletedAt,
  ApiPropertyMetadata,
  ApiPropertyNftCollectionId,
  ApiPropertyNftId,
  ApiPropertyUpdatedAt,
  ApiPropertyUserId,
} from 'common/decorators/docs.decorators';

@Entity()
@Index(['userId', 'nftCollectionId'])
export class Nft {
  @ObjectIdColumn()
  @ApiPropertyNftId()
  id: ObjectID;

  @Column()
  @ApiPropertyAssetIds()
  assetIds: AssetIdDto[];

  @Column()
  @ApiPropertyMetadata()
  metadata: Metadata;

  @Column()
  @Index()
  @ApiPropertyUserId()
  userId?: User['id'];

  @Column()
  @ApiPropertyNftCollectionId()
  nftCollectionId: NftCollection['id'];

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;

  @ManyToOne(() => NftCollection, (nftCollection) => nftCollection.id)
  @JoinColumn()
  nftCollection: NftCollection;

  @CreateDateColumn()
  @ApiPropertyCreatedAt()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiPropertyUpdatedAt()
  updatedAt: Date;

  @DeleteDateColumn()
  @ApiPropertyDeletedAt()
  deletedAt: Date;
}
