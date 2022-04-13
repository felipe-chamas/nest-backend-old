import { IsOptional, IsString } from 'class-validator';

export class UpdateNftCollectionDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  contractAddress?: string;

  @IsString()
  @IsOptional()
  tx?: string;
}
