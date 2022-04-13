import { IsString } from 'class-validator';

export class UpdateNftCollectionDto {
  @IsString()
  name: string;
}
