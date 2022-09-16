import { Body, Controller, Post, Session, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AccountId } from 'caip'
import { SessionData } from 'express-session'

import { AgreementSession } from '@common/dto/agreement-session.dto'
import { RequestForAgreementDto } from '@common/dto/request.dto'
import { SignatureAuthService } from '@services/auth/signature.service'
import { UserService } from '@services/user.service'

@Controller()
export class SignatureAuthController {
  constructor(private service: SignatureAuthService, private userService: UserService) {}

  @Post('request')
  async requestAgreement(
    @Body() { accountId }: RequestForAgreementDto,
    @Session() session: SessionData
  ): Promise<AgreementSession> {
    const agreementSession = new AgreementSession()
    agreementSession.message = this.service.getMessageToSign(accountId.address)
    agreementSession.accountId = AccountId.format(accountId)
    agreementSession.requestedAt = Date.now()
    session.agreement = agreementSession
    return agreementSession
  }

  @UseGuards(AuthGuard('signature'))
  @Post('login')
  async submitAgreement(@Session() session: SessionData) {
    const user = this.userService.findByUUID(session.user.uuid)
    return user
  }
}
