import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Address } from './address.dto';

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
  @IsOptional()
  @IsString({ each: true })
  address: Address[];

  @ApiProperty()
  @IsString()
  account: string;
}
