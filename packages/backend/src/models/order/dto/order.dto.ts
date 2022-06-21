import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { OrderHistoryDto } from 'models/order-history/dto/order-history.dto';

export class OrderDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  sellerId: string;

  @ApiProperty()
  @Expose()
  buyerId: string;

  @ApiProperty()
  @Expose()
  nftId: string;

  @ApiProperty()
  @Expose()
  price: string;

  @ApiProperty()
  @Expose()
  fee: string;

  @ApiProperty()
  @Expose()
  expireAt: Date;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

export class FindOneOrderDto extends OrderDto {
  @ApiProperty()
  order: OrderDto;

  @ApiProperty()
  @Expose()
  orderHistory: OrderHistoryDto;
}
