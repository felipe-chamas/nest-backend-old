import { Controller, Post, Session, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { SessionData } from 'express-session'

import { UserService } from '@services/user.service'

@Controller()
export class FractalAuthController {
  constructor(private userService: UserService) {}

  @Post('login')
  @UseGuards(AuthGuard('fractal'))
  async submitAgreement(@Session() session: SessionData) {
    const user = this.userService.findByUUID(session.user.uuid)
    return user
  }
}
