import { IsString } from 'class-validator';

export class CreateNftCollectionDto {
  @IsString()
  name: string;
}
