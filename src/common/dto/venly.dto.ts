import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

import { IsAssetId, IsAssetIdArray, IsAssetType } from '@common/decorators/caip.decorators'
import {
  ApiPropertyAssetIds,
  ApiPropertyAssetType,
  ApiPropertyTo,
  ApiPropertyUserUUID,
  ApiPropertyValue
} from '@common/decorators/docs.decorators'
import { IsPincode } from '@common/decorators/venly.decorators'

import type { AssetIdDto, AssetTypeDto } from '@common/types/caip'

export class WalletBodyDto {
  @IsString()
  @ApiPropertyUserUUID()
  uuid: string

  @IsPincode
  @ApiProperty({
    description: '4-6 digit PIN code',
    example: '123456'
  })
  pincode: string
}

export class MintWalletBodyDto extends WalletBodyDto {
  @IsAssetType
  @ApiPropertyAssetType()
  assetType: AssetTypeDto
}

export class NFTWalletBodyDto extends WalletBodyDto {
  @IsAssetId
  @ApiPropertyAssetIds()
  assetId: AssetIdDto
}

export class PayableNFTWalletBodyDto extends WalletBodyDto {
  @IsNumber()
  @ApiPropertyValue()
  value: number

  @IsAssetId
  @ApiPropertyAssetIds()
  assetId: AssetIdDto
}

export class NFTTransferBodyDto {
  @IsAssetIdArray
  @ApiPropertyAssetIds()
  assetIds: AssetIdDto[]

  @IsString()
  @ApiPropertyTo()
  to: string

  @IsPincode
  @ApiProperty({
    description: '4-6 digit PIN code',
    example: '123456'
  })
  pincode: string
}
