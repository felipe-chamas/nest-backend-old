import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import type { AssetTypeDto } from '@common/types/caip'
import type { Document } from 'mongoose'

@Schema({ timestamps: true, collection: 'nft_unboxing' })
export class NftUnboxingDto {
  @Prop({ type: Object })
  assetType: AssetTypeDto

  @Prop()
  nfts: string[]

  @Prop()
  tokenCount: number[]
}

export type NftUnboxingDocument = NftUnboxingDto & Document

export const NftUnboxingSchema = SchemaFactory.createForClass(NftUnboxingDto)
