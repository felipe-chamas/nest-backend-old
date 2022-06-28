import { Body, Controller, Post, Session, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AgreementSession } from './models';
import { AccountId } from 'caip';
import { Serialize } from 'common/interceptors';
import { SessionData } from 'express-session';
import { UserDto } from 'models/user/dto';
import { RequestForAgreementDto } from './dto';

import { SignatureAuthService } from './service';
import { UserService } from 'models/user';

@Controller('auth/signature')
@Serialize(UserDto)
export class SignatureAuthController {
  constructor(
    private service: SignatureAuthService,
    private userService: UserService,
  ) {}

  @Post('/request')
  async requestAgreement(
    @Body() { accountId }: RequestForAgreementDto,
    @Session() session: SessionData,
  ): Promise<AgreementSession> {
    const agreementSession = new AgreementSession();
    agreementSession.message = this.service.getMessageToSign(accountId.address);
    agreementSession.accountId = AccountId.format(accountId);
    agreementSession.requestedAt = Date.now();
    session.agreement = agreementSession;
    return agreementSession;
  }

  @UseGuards(AuthGuard('signature'))
  @Post('/login')
  async submitAgreement(@Session() session: SessionData) {
    const user = this.userService.findById(session.user.id);
    return user;
  }
}
