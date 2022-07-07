import { ApiProperty } from '@nestjs/swagger';
import { AccountIdParams } from 'caip';
import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsAccountIdArray } from 'common/decorators';
import { Role } from 'common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  roles?: Role[];

  @ApiProperty()
  @IsOptional()
  @IsObject()
  discord?: {
    id: string;
    username: string;
  };

  @ApiProperty()
  @IsAccountIdArray
  accountIds: AccountIdParams[];
}
