import { AccountIdParams } from 'caip'
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator'

import { IsAccountIdArray } from '@common/decorators/caip.decorators'
import {
  ApiPropertyUserAccountIds,
  ApiPropertyUserSocialAccounts,
  ApiPropertyUserEmail,
  ApiPropertyUserName,
  ApiPropertyUserRoles
} from '@common/decorators/docs.decorators'
import { Role } from '@common/enums/role.enum'
import { SocialAccounts } from '@common/types/social'

export class CreateUserDto {
  @ApiPropertyUserEmail()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyUserName()
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyUserRoles()
  @IsOptional()
  @IsArray()
  roles?: Role[]

  @ApiPropertyUserSocialAccounts()
  @IsOptional()
  socialAccounts?: SocialAccounts

  @ApiPropertyUserAccountIds()
  @IsAccountIdArray
  accountIds: AccountIdParams[]
}
