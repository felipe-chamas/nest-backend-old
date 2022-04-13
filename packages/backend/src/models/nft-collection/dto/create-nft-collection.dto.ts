import { IsOptional, IsString } from 'class-validator';

export class CreateNftCollectionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  contractAddress?: string;

  @IsOptional()
  @IsString()
  tx?: string;
}
