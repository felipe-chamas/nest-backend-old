import { ApiProperty } from '@nestjs/swagger';
import { AccountIdParams } from 'caip';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { IsAccountIdArray } from 'common/decorators';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @ApiProperty()
  @IsAccountIdArray
  accountIds: string[] | AccountIdParams[];
}
