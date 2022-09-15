import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

import { IsAssetId } from '@common/decorators/caip.decorators'
import { ApiPropertyUserId } from '@common/decorators/docs.decorators'
import { IsPincode } from '@common/decorators/venly.decorators'

import type { AssetIdDto } from '@common/types/caip'

export class WalletBodyDto {
  @IsString()
  @ApiPropertyUserId()
  uuid: string

  @IsPincode
  @ApiProperty({
    description: '4-6 digit PIN code',
    example: '123456'
  })
  pincode: string
}

export class NFTWalletBodyDto extends WalletBodyDto {
  @IsAssetId
  assetId: AssetIdDto
}

export class PayableNFTWalletBodyDto extends NFTWalletBodyDto {
  @IsNumber()
  value: number
}
