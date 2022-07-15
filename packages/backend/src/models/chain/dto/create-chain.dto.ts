import { IsNumber } from 'class-validator';
import { IsChainId } from 'common/decorators';
import { ChainIdDto } from 'common/types';

export class CreateChainDto {
  @IsChainId
  chainId: ChainIdDto;

  @IsNumber()
  block: number;

  @IsNumber()
  confirmations: number;
}
