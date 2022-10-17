import { ApiProperty } from '@nestjs/swagger'
import { AccountId } from 'caip'
import { Exclude, Expose } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'

import { IsAccountId } from '@common/decorators/caip.decorators'

@Exclude()
export class RequestForAgreementDto {
  @Expose({ name: 'accountId' })
  @ApiProperty()
  @IsAccountId
  _accountId: string

  @Expose()
  get accountId() {
    return new AccountId(this._accountId)
  }
}

export class LinkEpicDto {
  @IsNotEmpty()
  @IsString()
  code : string;
  
  @IsNotEmpty()
  @IsString()
  userId: string;
}