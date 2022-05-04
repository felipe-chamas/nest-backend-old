import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Address {
  @ApiProperty()
  @IsString({ each: true })
  address: string[];
}
