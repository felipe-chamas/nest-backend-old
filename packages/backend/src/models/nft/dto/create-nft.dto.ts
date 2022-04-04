import { IsString } from 'class-validator';

export class CreateNftDto {
  @IsString()
  properties: Record<string, string>;

  @IsString()
  userId: string;

  @IsString()
  nftCollectionId: string;
}
