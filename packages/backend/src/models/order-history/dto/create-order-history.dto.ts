import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { Status } from 'common/types';

export class CreateOrderHistoryDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsOptional()
  @IsIn(['open', 'closed', 'cancelled'], {
    message: `Status is invalid. Accepted statuses: 'open' || 'closed' || 'cancelled'`,
  })
  lastStatus: Status;

  @ApiProperty()
  @IsOptional()
  @IsIn(['open', 'closed', 'cancelled'], {
    message: `Status is invalid. Accepted statuses: 'open' || 'closed' || 'cancelled'`,
  })
  currentStatus: Status;
}
