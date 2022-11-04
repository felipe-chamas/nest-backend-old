import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'

import {
  ApiPropertyAvatarUrl,
  ApiPropertyUserAccountIds,
  ApiPropertyUserEmail,
  ApiPropertyUserName,
  ApiPropertyUserRoles,
  ApiPropertyUserSocialAccounts,
  ApiPropertyUserUUID,
  ApiPropertyWallet
} from '@common/decorators/docs.decorators'
import { WalletDto } from '@common/dto/wallet.dto'
import { Role } from '@common/enums/role.enum'

import type { AccountIdDto } from '@common/types/caip'
import type { SocialAccounts } from '@common/types/social'
import type { Document } from 'mongoose'

@Schema({ timestamps: true, collection: 'user' })
export class UserDto {
  @ApiPropertyUserUUID()
  @Prop({ unique: true, index: true })
  uuid: string

  @ApiPropertyUserName()
  @Prop()
  name: string

  @ApiPropertyUserEmail()
  @Prop()
  email: string

  @ApiPropertyUserRoles()
  @Prop()
  roles: Role[]

  @ApiPropertyUserAccountIds()
  @Prop()
  accountIds: AccountIdDto[]

  @ApiPropertyWallet()
  @Prop()
  wallet?: WalletDto

  @ApiPropertyUserSocialAccounts()
  @Prop({ type: mongoose.Schema.Types.Mixed })
  socialAccounts: SocialAccounts

  @ApiPropertyAvatarUrl()
  @Prop()
  imageUrl: string
}

export type UserDocument = UserDto & Document

export const UserSchema = SchemaFactory.createForClass(UserDto)

UserSchema.index({ 'socialAccounts.steam.id': 1 })
