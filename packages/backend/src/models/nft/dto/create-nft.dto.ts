import { Optional } from '@nestjs/common';
import { IsString } from 'class-validator';

export class CreateNftDto {
  @IsString()
  properties: Record<string, string>;

  @IsString()
  @Optional()
  userId: string;

  @IsString()
  nftCollectionId: string;
}
