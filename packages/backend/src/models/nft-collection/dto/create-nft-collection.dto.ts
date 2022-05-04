import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateNftCollectionDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contractAddress?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  tx?: string;
}
