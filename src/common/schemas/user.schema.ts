import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'

import { WalletDto } from '@common/dto/wallet.dto'
import { Role } from '@common/enums/role.enum'

import type { AccountIdDto } from '@common/types/caip'
import type { SocialAccounts } from '@common/types/social'
import type { Document } from 'mongoose'

@Schema({ timestamps: true, collection: 'user' })
export class UserDto {
  @Prop()
  uuid: string

  @Prop()
  name?: string

  @Prop()
  email?: string

  @Prop()
  roles: Role[]

  @Prop()
  accountIds: AccountIdDto[]

  @Prop()
  wallet?: WalletDto

  @Prop({ type: mongoose.Schema.Types.Mixed })
  socialAccounts?: SocialAccounts

  @Prop()
  avatarUrl?: string
}

export type UserDocument = UserDto & Document

export const UserSchema = SchemaFactory.createForClass(UserDto)
