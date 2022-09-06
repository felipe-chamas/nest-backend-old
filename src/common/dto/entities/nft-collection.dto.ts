import slugify from 'slugify'
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn
} from 'typeorm'

import {
  ApiPropertyAssetTypes,
  ApiPropertyCreatedAt,
  ApiPropertyDeletedAt,
  ApiPropertyNftCollectionIcon,
  ApiPropertyNftCollectionId,
  ApiPropertyNftCollectionName,
  ApiPropertyNftCollectionSlug,
  ApiPropertyUpdatedAt
} from '@common/decorators/docs.decorators'

import type { AssetTypeDto } from '@common/types/caip'

@Entity()
export class NftCollectionDto {
  @ObjectIdColumn()
  @ApiPropertyNftCollectionId()
  id: ObjectID

  @Column()
  @ApiPropertyAssetTypes()
  assetTypes: AssetTypeDto[]

  @Column()
  @ApiPropertyNftCollectionSlug()
  slug: string

  @Column()
  @ApiPropertyNftCollectionName()
  name: string

  @Column()
  @ApiPropertyNftCollectionIcon()
  icon: string

  @CreateDateColumn()
  @ApiPropertyCreatedAt()
  createdAt: Date

  @UpdateDateColumn()
  @ApiPropertyUpdatedAt()
  updatedAt: Date

  @DeleteDateColumn()
  @ApiPropertyDeletedAt()
  deletedAt: Date

  @BeforeInsert()
  beforeSave() {
    this.slug = slugify(this.name, { lower: true })
  }
}
