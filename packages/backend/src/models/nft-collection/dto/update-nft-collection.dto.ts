import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateNftCollectionDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  contractAddress?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  tx?: string;
}
