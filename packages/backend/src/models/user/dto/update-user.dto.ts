import { ApiProperty } from '@nestjs/swagger';
import { AccountIdParams } from 'caip';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { IsAccountIdArray } from 'common/decorators';
import { Role } from 'common/enums/role.enum';

export class UpdateUserDto {
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
  @IsAccountIdArray
  accountIds?: string[] | AccountIdParams[];

  @ApiProperty()
  @IsOptional()
  roles?: Role[];

  @ApiProperty()
  @IsOptional()
  discord?: {
    id: string;
    username: string;
  };
}
