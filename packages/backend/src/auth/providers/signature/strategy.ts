import { Strategy, VerifiedCallback } from 'passport-custom';
import {
  Injectable,
  BadRequestException,
  RequestTimeoutException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { SignatureAuthService } from './service';
import { UserService } from 'models/user';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { validateSync } from 'common/utils';
import { SubmitSignedAgreementDto } from './dto';
import { AccountId } from 'caip';
import { AgreementSession } from './models/agreement-session';

import { MAX_WAIT_FOR_SIGNED_AGREEMENT } from './constants';

@Injectable()
export class SignatureStrategy extends PassportStrategy(Strategy, 'signature') {
  constructor(
    private userService: UserService,
    private service: SignatureAuthService
  ) {
    super();
  }

  async validate(req: Request, done: VerifiedCallback) {
    const agreement = plainToInstance(AgreementSession, req.session.agreement);
    const body = plainToInstance(SubmitSignedAgreementDto, req.body);
    const errors = [];
    errors.push(...validateSync(agreement, AgreementSession));
    errors.push(...validateSync(body, SubmitSignedAgreementDto));
    if (errors.length) return done(new BadRequestException(errors));

    const elapsedTime = Date.now() - agreement.requestedAt;
    if (elapsedTime > MAX_WAIT_FOR_SIGNED_AGREEMENT)
      return done(
        new RequestTimeoutException({
          message: 'Session request timeout, please sign a new message',
        })
      );

    const accountId = new AccountId(agreement.accountId);
    const correctSignature = this.service.verifySignature(
      accountId.chainId.toString(),
      agreement.message,
      body.signature,
      accountId.address
    );
    if (!correctSignature)
      return done(
        new BadRequestException(
          'Provided signature does not match address of agreement request'
        )
      );

    const foundUser = await this.userService.findByAccountId(accountId);
    const existingUser = foundUser
      ? foundUser
      : await this.userService.create({
          accountIds: [accountId.toJSON()],
        });

    req.session.user = {
      id: existingUser.id,
      roles: existingUser.roles,
    };

    delete req.session.agreement;
    return done(undefined, existingUser);
  }
}
