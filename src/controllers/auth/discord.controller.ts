import { Controller, Post, Req, Session, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { SessionData } from 'express-session'

import { UserService } from '@services/user.service'

@Controller()
export class DiscordController {
  constructor(private readonly userService: UserService) {}

  @Post('link')
  @UseGuards(AuthGuard('discord'))
  async link(@Req() req: Request, @Session() session: SessionData) {
    const user = await this.userService.findByUUID(session.user.uuid)
    return this.userService.update(session.user.uuid, {
      socialAccounts: {
        ...user.socialAccounts,
        discord: {
          id: req.user.id,
          username: `${req.user.username}#${req.user.discriminator}`
        }
      }
    })
  }

  @Post('unlink')
  async unlink(@Session() session: SessionData) {
    const user = await this.userService.findByUUID(session.user.uuid)
    return this.userService.update(session.user.uuid, {
      socialAccounts: {
        ...user.socialAccounts,
        discord: null
      }
    })
  }
}
