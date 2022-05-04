import { IsIn, IsString } from 'class-validator';
import { Status } from 'common/types';

export class CreateOrderDto {
  @IsIn(['open', 'closed', 'cancelled'], {
    message: `Status is invalid. Accepted statuses: 'open' || 'closed' || 'cancelled'`,
  })
  status: Status;

  @IsString()
  sellerId: string;

  @IsString()
  buyerId?: string;

  @IsString()
  nftId: string;

  @IsString()
  price: string;

  @IsString()
  fee: string;
}
