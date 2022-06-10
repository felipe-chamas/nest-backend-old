import { ApiProperty } from '@nestjs/swagger';
import { AccountIdParams } from 'caip';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { IsAccountIdArray } from 'common/decorators';
import { Role } from 'common/enums/role.enum';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsAccountIdArray
  account: string[] | AccountIdParams[];

  @ApiProperty()
  @IsOptional()
  roles: Role[];
}
