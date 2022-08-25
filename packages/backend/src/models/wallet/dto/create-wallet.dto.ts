import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { IsAssetId } from 'common/decorators';
import { ApiPropertyUserId } from 'common/decorators/docs.decorators';
import { IsPincode } from 'common/decorators/venly';
import { AssetIdDto } from 'common/types';

export class WalletBodyDto {
  @IsString()
  @ApiPropertyUserId()
  userId: string;

  @IsPincode
  @ApiProperty({
    description: '4-6 digit PIN code',
    example: '123456',
  })
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
