import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { Status } from 'common/types';

export class CreateOrderDto {
  @ApiProperty()
  @IsIn(['open', 'closed', 'cancelled'], {
    message: `Status is invalid. Accepted statuses: 'open' || 'closed' || 'cancelled'`,
  })
  @IsOptional()
  status: Status = 'open';

  @ApiProperty()
  @IsString()
  sellerId: string;

  @ApiProperty()
  @IsString()
  buyerId?: string;

  @ApiProperty()
  @IsString()
  nftId: string;

  @ApiProperty()
  @IsString()
  price: string;

  @ApiProperty()
  @IsString()
  fee: string;
}
