import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn
} from 'typeorm'

import {
  ApiPropertyAvatarUrl,
  ApiPropertyCreatedAt,
  ApiPropertyDeletedAt,
  ApiPropertyUpdatedAt,
  ApiPropertyUserAccountIds,
  ApiPropertyUserSocialAccounts,
  ApiPropertyUserEmail,
  ApiPropertyUserId,
  ApiPropertyUserName,
  ApiPropertyUserRoles,
  ApiPropertyWallet,
  ApiPropertyUserUUID
} from '@common/decorators/docs.decorators'
import { WalletDto } from '@common/dto/wallet.dto'
import { Role } from '@common/enums/role.enum'

import type { AccountIdDto } from '@common/types/caip'
import type { SocialAccounts } from '@common/types/social'

@Entity()
@Index(['email'])
export class UserDto {
  @ObjectIdColumn()
  @ApiPropertyUserId()
  id: ObjectID

  @Column()
  @ApiPropertyUserUUID()
  uuid: string

  @Column()
  @ApiPropertyUserName()
  name?: string

  @Column()
  @ApiPropertyUserEmail()
  email?: string

  @Column()
  @ApiPropertyUserRoles()
  roles: Role[]

  @Column()
  @ApiPropertyUserAccountIds()
  accountIds: AccountIdDto[]

  @Column()
  @ApiPropertyWallet()
  wallet?: WalletDto

  @Column()
  @ApiPropertyUserSocialAccounts()
  socialAccounts?: SocialAccounts

  @Column()
  @ApiPropertyAvatarUrl()
  avatarUrl?: string

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
