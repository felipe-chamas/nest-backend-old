import { IsNumber, IsString } from 'class-validator'

import { IsAccountId } from '@common/decorators/caip.decorators'

export class AgreementSession {
  @IsString()
  message: string

  @IsAccountId
  accountId: string

  @IsNumber()
  requestedAt: number
}
