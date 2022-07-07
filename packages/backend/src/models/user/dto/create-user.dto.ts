import { AccountIdParams } from 'caip';
import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsAccountIdArray } from 'common/decorators';
import {
  ApiPropertyUserAccountIds,
  ApiPropertyUserDiscord,
  ApiPropertyUserEmail,
  ApiPropertyUserName,
  ApiPropertyUserRoles,
} from 'common/decorators/docs.decorators';
import { Role } from 'common/enums/role.enum';

export class CreateUserDto {
  @ApiPropertyUserEmail()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyUserName()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyUserRoles()
  @IsOptional()
  @IsArray()
  roles?: Role[];

  @ApiPropertyUserDiscord()
  @IsOptional()
  @IsObject()
  discord?: {
    id: string;
    username: string;
  };

  @ApiPropertyUserAccountIds()
  @IsAccountIdArray
  accountIds: AccountIdParams[];
}
