import { model, Schema } from 'mongoose'

import { UserI } from './types'

const userSchema = new Schema<UserI>(
  {
    uuid: { type: String, unique: true, require: true },
    name: String,
    email: String,
    roles: [String],
    accountIds: [Schema.Types.Mixed],
    wallet: {
      id: String,
      address: String,
      walletType: String,
      secretType: String,
      identifier: String,
      description: String,
      createdAt: String
    },
    socialAccounts: Schema.Types.Mixed,
    imageUrl: String
  },
  { collection: 'user' }
)

const User = model<UserI>('User', userSchema)
export default User
