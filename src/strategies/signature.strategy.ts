import { Injectable, BadRequestException, RequestTimeoutException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AccountId } from 'caip'
import { plainToInstance } from 'class-transformer'
import { Request } from 'express'
import { Strategy, VerifiedCallback } from 'passport-custom'

import { MAX_WAIT_FOR_SIGNED_AGREEMENT } from '@common/constants/signature'
import { AgreementSession } from '@common/dto/agreement-session.dto'
import { SubmitSignedAgreementDto } from '@common/dto/submit.dto'
import { validateSync } from '@common/utils'
import { SignatureAuthService } from '@services/auth/signature.service'
import { UserService } from '@services/user.service'

@Injectable()
export class SignatureStrategy extends PassportStrategy(Strategy, 'signature') {
  constructor(private userService: UserService, private service: SignatureAuthService) {
    super()
  }

  async validate(req: Request, done: VerifiedCallback) {
    const agreement = plainToInstance(AgreementSession, req.session.agreement)
    const body = plainToInstance(SubmitSignedAgreementDto, req.body)
    const errors = []
    errors.push(...validateSync(agreement, AgreementSession))
    errors.push(...validateSync(body, SubmitSignedAgreementDto))
    if (errors.length) return done(new BadRequestException(errors))

    const elapsedTime = Date.now() - agreement.requestedAt
    if (elapsedTime > MAX_WAIT_FOR_SIGNED_AGREEMENT)
      return done(
        new RequestTimeoutException({
          message: 'Session request timeout, please sign a new message'
        })
      )

    const accountId = new AccountId(agreement.accountId)
    const correctSignature = this.service.verifySignature(
      accountId.chainId.toString(),
      agreement.message,
      body.signature,
      accountId.address
    )
    if (!correctSignature)
      return done(
        new BadRequestException('Provided signature does not match address of agreement request')
      )

    const foundUser = await this.userService.findByAccountId(accountId)

    const user = foundUser
      ? foundUser
      : await this.userService.create({
          accountIds: [accountId.toJSON()]
        })

    req.session.user = {
      id: user.id.toString(),
      roles: user.roles
    }

    delete req.session.agreement
    return done(undefined, user)
  }
}
