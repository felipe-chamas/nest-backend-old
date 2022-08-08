import { IsEmail, IsOptional } from 'class-validator';
import { IsAccountIdArray } from 'common/decorators';
import {
  ApiPropertyUserAccountIds,
  ApiPropertyUserSocialAccounts,
  ApiPropertyUserEmail,
  ApiPropertyUserName,
  ApiPropertyUserRoles,
} from 'common/decorators/docs.decorators';
import { Role } from 'common/enums/role.enum';
import { AccountIdDto, SocialAccounts } from 'common/types';

export class UpdateUserDto {
  @ApiPropertyUserEmail()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyUserName()
  @IsOptional()
  name?: string;

  @ApiPropertyUserAccountIds()
  @IsAccountIdArray
  @IsOptional()
  accountIds?: AccountIdDto[];

  @ApiPropertyUserRoles()
  @IsOptional()
  roles?: Role[];

  @ApiPropertyUserSocialAccounts()
  @IsOptional()
  socialAccounts?: SocialAccounts;
}
