import { Controller, Post, Session, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { SessionData } from 'express-session'

import { UserService } from '@services/user.service'

@Controller()
export class FractalAuthController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard('fractal'))
  @Post('/login')
  async submitAgreement(@Session() session: SessionData) {
    const user = this.userService.findById(session.user.id)
    return user
  }
}
