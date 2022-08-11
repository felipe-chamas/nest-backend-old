import { Exclude, Expose } from 'class-transformer';
import { IsIn, IsString } from 'class-validator';

@Exclude()
export class WalletDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  address: string;

  @Expose()
  @IsString()
  @IsIn(['UNRECOVERABLE_WHITE_LABEL', 'WHITE_LABEL'])
  walletType: 'UNRECOVERABLE_WHITE_LABEL' | 'WHITE_LABEL';

  @Expose()
  @IsString()
  @IsIn(['ETHEREUM', 'BSC'])
  secretType: 'ETHEREUM' | 'BSC';

  @Expose()
  @IsString()
  identifier: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsString()
  createdAt: string;
}
