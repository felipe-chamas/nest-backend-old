import { Exclude, Expose } from 'class-transformer';
import { IsIn, IsString } from 'class-validator';
import {
  ApiPropertyWalletAddress,
  ApiPropertyWalletCreatedAt,
  ApiPropertyWalletDescription,
  ApiPropertyWalletGameTokenBalance,
  ApiPropertyWalletId,
  ApiPropertyWalletIdentifier,
  ApiPropertyWalletSecretType,
  ApiPropertyWalletType,
} from 'common/decorators/docs.decorators';

@Exclude()
export class WalletDto {
  @Expose()
  @IsString()
  @ApiPropertyWalletId()
  id: string;

  @Expose()
  @IsString()
  @ApiPropertyWalletAddress()
  address: string;

  @Expose()
  @IsString()
  @IsIn(['UNRECOVERABLE_WHITE_LABEL', 'WHITE_LABEL'])
  @ApiPropertyWalletType()
  walletType: 'UNRECOVERABLE_WHITE_LABEL' | 'WHITE_LABEL';

  @Expose()
  @IsString()
  @IsIn(['ETHEREUM', 'BSC'])
  @ApiPropertyWalletSecretType()
  secretType: 'ETHEREUM' | 'BSC';

  @Expose()
  @IsString()
  @ApiPropertyWalletIdentifier()
  identifier: string;

  @Expose()
  @IsString()
  @ApiPropertyWalletDescription()
  description: string;

  @Expose()
  @IsString()
  @ApiPropertyWalletCreatedAt()
  createdAt: string;
}

export class WalletResponseDto {
  @Expose()
  @IsString()
  @ApiPropertyWalletId()
  id: string;

  @Expose()
  @IsString()
  @ApiPropertyWalletAddress()
  address: string;

  @Expose()
  @IsString()
  @ApiPropertyWalletIdentifier()
  identifier: string;

  @Expose()
  @IsString()
  @ApiPropertyWalletGameTokenBalance()
  gameTokenBalance: string;
}
