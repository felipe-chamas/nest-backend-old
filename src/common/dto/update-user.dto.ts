import { IsEmail, IsOptional } from 'class-validator'

import { IsAccountIdArray } from '@common/decorators/caip.decorators'
import {
  ApiPropertyUserAccountIds,
  ApiPropertyUserSocialAccounts,
  ApiPropertyUserEmail,
  ApiPropertyUserName,
  ApiPropertyUserRoles
} from '@common/decorators/docs.decorators'
import { WalletDto } from '@common/dto/wallet.dto'
import { Role } from '@common/enums/role.enum'

import type { AccountIdDto } from '@common/types/caip'
import type { SocialAccounts } from '@common/types/social'

export class UpdateUserDto {
  @ApiPropertyUserEmail()
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiPropertyUserName()
  @IsOptional()
  name?: string

  @ApiPropertyUserAccountIds()
  @IsAccountIdArray
  @IsOptional()
  accountIds?: AccountIdDto[]

  @ApiPropertyUserRoles()
  @IsOptional()
  roles?: Role[]

  @ApiPropertyUserSocialAccounts()
  @IsOptional()
  socialAccounts?: SocialAccounts

  @IsOptional()
  wallet?: WalletDto
}
