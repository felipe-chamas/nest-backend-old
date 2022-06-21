import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Status } from 'common/types';
import { OrderDto } from 'models/order/dto/order.dto';

export class UpdateOrderHistoryDto {
  @ApiProperty()
  @Expose()
  @IsOptional()
  id: string;

  @ApiProperty()
  @Expose()
  @IsOptional()
  userId: string;

  @ApiProperty()
  @Expose()
  @IsOptional()
  orderId: string;

  @ApiProperty()
  @Expose()
  @IsOptional()
  currentStatus: Status;

  @ApiProperty()
  @Expose()
  @IsOptional()
  lastStatus: Status;
}

export class UpdateOrderHistoryResponseDto extends UpdateOrderHistoryDto {
  @ApiProperty()
  order: OrderDto;
}
