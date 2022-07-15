import { IsNumber, IsOptional } from 'class-validator';
import { IsChainId } from 'common/decorators';
import { ChainIdDto } from 'common/types';

export class UpdateChainDto {
  @IsChainId
  @IsOptional()
  chainId?: ChainIdDto;

  @IsNumber()
  @IsOptional()
  block?: number;

  @IsNumber()
  @IsOptional()
  confirmations?: number;
}
