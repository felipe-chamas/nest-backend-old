import { HttpService } from '@nestjs/axios'
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AccountId } from 'caip'
import { plainToInstance } from 'class-transformer'
import { Request } from 'express'
import { Strategy, VerifiedCallback } from 'passport-custom'
import { firstValueFrom } from 'rxjs'

import { validateSync } from '@common/utils'
import { UserService } from '@services/user.service'

import { LoginDto } from '../common/dto/login.dto'

@Injectable()
export class FractalStrategy extends PassportStrategy(Strategy, 'fractal') {
  constructor(private userService: UserService, private readonly httpService: HttpService) {
    super()
  }

  async validate(req: Request, done: VerifiedCallback) {
    const body = plainToInstance(LoginDto, req.body)
    const errors = []
    errors.push(...validateSync(body, LoginDto))
    if (errors.length) return done(new BadRequestException(errors))

    const { bearerToken } = body
    const accountId = new AccountId(body.accountId)

    const {
      data: { accountPublicKey }
    } = await firstValueFrom(
      this.httpService.get('https://api.fractal.is/sdk/v1/wallet/info', {
        headers: { Authorization: `Bearer ${bearerToken}` }
      })
    )

    if (!accountPublicKey || accountPublicKey !== accountId.address)
      return done(new UnauthorizedException('Invalid public key'))

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
