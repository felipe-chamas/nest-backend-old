import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'

import type { AssetIdDto } from '@common/types/caip'
import type { Metadata } from '@common/types/metadata'
import type { Document } from 'mongoose'

@Schema({ timestamps: true, collection: 'nft' })
export class NftDto {
  @Prop()
  assetIds: AssetIdDto[]

  @Prop({ type: mongoose.Schema.Types.Mixed })
  metadata: Metadata
}

export type NftDocument = NftDto & Document

export const NftSchema = SchemaFactory.createForClass(NftDto)
