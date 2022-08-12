import { IsNumber, IsString } from 'class-validator';
import { IsAssetId } from 'common/decorators';
import { IsPincode } from 'common/decorators/venly';
import { AssetIdDto } from 'common/types';

export class WalletBodyDto {
  @IsString()
  userId: string;

  @IsPincode
  pincode: string;
}

export class NFTWalletBodyDto extends WalletBodyDto {
  @IsAssetId
  assetId: AssetIdDto;
}

export class PayableNFTWalletBodyDto extends NFTWalletBodyDto {
  @IsNumber()
  value: number;
}
