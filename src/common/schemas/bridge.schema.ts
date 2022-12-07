import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import type { Document } from 'mongoose'

@Schema({ timestamps: true, collection: 'bridge' })
export class BridgeDto {
  @Prop({ index: true, unique: true })
  txSource: string

  @Prop()
  txDestination: string
}

export type BridgeDocument = BridgeDto & Document

export const BridgeSchema = SchemaFactory.createForClass(BridgeDto)
