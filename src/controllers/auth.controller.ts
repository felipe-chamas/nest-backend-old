import { Controller, Post, Session } from '@nestjs/common'
import { SessionData } from 'express-session'

@Controller()
export class AuthController {
  @Post('/logout')
  async submitAgreement(@Session() session: SessionData) {
    session.destroy()
    return 'OK'
  }
}
