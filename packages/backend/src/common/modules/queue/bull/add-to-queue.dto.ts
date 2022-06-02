import { IsIn, IsString } from 'class-validator';

export class AddToQueueDto {
  @IsString()
  tx: string;

  @IsString()
  @IsIn(['TokenClaimed', 'Transfer'])
  event: string;

  @IsString()
  contractAddress: string;
}
