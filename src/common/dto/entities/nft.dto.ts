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
  UpdateDateColumn
} from 'typeorm'

import {
  ApiPropertyAssetIds,
  ApiPropertyCreatedAt,
  ApiPropertyDeletedAt,
  ApiPropertyMetadata,
  ApiPropertyNftCollectionId,
  ApiPropertyNftId,
  ApiPropertyUpdatedAt,
  ApiPropertyUserId
} from '@common/decorators/docs.decorators'

import { NftCollectionDto } from './nft-collection.dto'
import { UserDto } from './user.dto'

import type { AssetIdDto } from '@common/types/caip'
import type { Metadata } from '@common/types/metadata'

@Entity()
@Index(['userId', 'nftCollectionId'])
export class NftDto {
  @ObjectIdColumn()
  @ApiPropertyNftId()
  id: ObjectID

  @Column()
  @ApiPropertyAssetIds()
  assetIds: AssetIdDto[]

  @Column()
  @ApiPropertyMetadata()
  metadata: Metadata

  @Column()
  @Index()
  @ApiPropertyUserId()
  userId?: UserDto['id']

  @Column()
  @ApiPropertyNftCollectionId()
  nftCollectionId: NftCollectionDto['id']

  @ManyToOne(() => UserDto, (user) => user.id)
  @JoinColumn()
  user: UserDto

  @ManyToOne(() => NftCollectionDto, (nftCollection) => nftCollection.id)
  @JoinColumn()
  nftCollection: NftCollectionDto

  @CreateDateColumn()
  @ApiPropertyCreatedAt()
  createdAt: Date

  @UpdateDateColumn()
  @ApiPropertyUpdatedAt()
  updatedAt: Date

  @DeleteDateColumn()
  @ApiPropertyDeletedAt()
  deletedAt: Date
}
