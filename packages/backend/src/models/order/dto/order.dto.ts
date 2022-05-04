import { Expose } from 'class-transformer';

export class OrderDto {
  @Expose()
  id: string;

  @Expose()
  status: string;

  @Expose()
  sellerId: string;

  @Expose()
  buyerId: string;

  @Expose()
  nftId: string;

  @Expose()
  price: string;

  @Expose()
  fee: string;

  @Expose()
  expireAt: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
