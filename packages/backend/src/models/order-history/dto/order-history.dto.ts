import { Expose } from 'class-transformer';
import { Status } from 'common/types';

export class OrderHistoryDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  orderId: string;

  @Expose()
  currentStatus: Status;

  @Expose()
  lastStatus: Status;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
