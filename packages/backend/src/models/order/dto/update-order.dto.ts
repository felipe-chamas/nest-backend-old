import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { OrderHistoryDto } from '../../order-history/dto/order-history.dto';
import { OrderDto } from './order.dto';

export class UpdateOrderDto {
  @ApiProperty()
  @IsOptional()
  status: string;

  @ApiProperty()
  @IsOptional()
  sellerId: string;

  @ApiProperty()
  @IsOptional()
  buyerId: string;

  @ApiProperty()
  @IsOptional()
  nftId: string;

  @ApiProperty()
  @IsOptional()
  price: string;

  @ApiProperty()
  @IsOptional()
  fee: string;

  @ApiProperty()
  @IsOptional()
  expireAt: Date;
}

export class UpdateOrderDtoResponse {
  @ApiProperty()
  order: OrderDto;

  @ApiProperty()
  orderHistory: OrderHistoryDto;
}
