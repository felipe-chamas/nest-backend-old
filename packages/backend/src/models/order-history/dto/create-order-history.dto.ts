import { IsIn, IsString } from 'class-validator';
import { Status } from 'common/types';

export class CreateOrderHistoryDto {
  @IsString()
  orderId: string;

  @IsIn(['open', 'closed', 'cancelled'], {
    message: `Status is invalid. Accepted statuses: 'open' || 'closed' || 'cancelled'`,
  })
  lastStatus: Status;

  @IsIn(['open', 'closed', 'cancelled'], {
    message: `Status is invalid. Accepted statuses: 'open' || 'closed' || 'cancelled'`,
  })
  currentStatus: Status;
}
