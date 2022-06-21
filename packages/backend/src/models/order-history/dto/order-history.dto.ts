import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Status } from 'common/types';
import { OrderDto } from 'models/order/dto/order.dto';

export class OrderHistoryDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty()
  @Expose()
  orderId: string;

  @ApiProperty()
  @Expose()
  currentStatus: Status;

  @ApiProperty()
  @Expose()
  lastStatus: Status;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

export class FindOneOrderHistoryDto extends OrderHistoryDto {
  @ApiProperty()
  @Expose()
  order: OrderDto;
}
