import { ApiProperty } from '@nestjs/swagger';
import { IsAccountId } from 'common/decorators';
import { AccountId } from 'caip';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RequestForAgreementDto {
  @Expose({ name: 'accountId' })
  @ApiProperty()
  @IsAccountId
  _accountId: string;

  @Expose()
  get accountId() {
    return new AccountId(this._accountId);
  }
}
