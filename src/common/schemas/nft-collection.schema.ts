import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import type { AssetTypeDto } from '@common/types/caip'
import type { Document } from 'mongoose'

@Schema({ timestamps: true, collection: 'nft_collection' })
export class NftCollectionDto {
  @Prop()
  assetTypes: AssetTypeDto[]

  @Prop()
  slug: string

  @Prop()
  name: string

  @Prop()
  icon: string
}

export type NftCollectionDocument = NftCollectionDto & Document

export const NftCollectionSchema = SchemaFactory.createForClass(NftCollectionDto)
