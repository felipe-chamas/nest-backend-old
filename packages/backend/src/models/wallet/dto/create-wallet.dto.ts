import { IsString } from 'class-validator';
import { IsPincode } from 'common/decorators/venly';

export class CreateWalletDto {
  @IsString()
  userId: string;

  @IsPincode
  pincode: string;
}
