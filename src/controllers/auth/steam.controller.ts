import {
  UnauthorizedException,
  Controller,
  Post,
  Get,
  Session,
  UseGuards,
  Req
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { SessionData } from 'express-session'

import { UserService } from '@services/user.service'

@Controller()
export class SteamController {
  constructor(private readonly userService: UserService) {}

  @Get('link')
  @UseGuards(AuthGuard('steam'))
  async link() {
    return
  }

  @Post('create')
  @UseGuards(AuthGuard('steam'))
  async create(@Req() req: Request) {
    return this.userService.create({
      name: req.user._json?.realname,
      imageUrl: req.user._json?.avatarfull,
      socialAccounts: {
        steam: {
          id: req.user.id,
          username: req.user.displayName
        }
      }
    })
  }

  @Post('save')
  @UseGuards(AuthGuard('steam'))
  async save(@Req() req: Request, @Session() session: SessionData) {
    if (!session.user) throw new UnauthorizedException('No user authenticated in session')
    const user = await this.userService.findByUUID(session.user.uuid)
    return this.userService.update(session.user.uuid, {
      imageUrl: user.imageUrl ?? req.user._json?.avatarfull,
      socialAccounts: {
        ...user.socialAccounts,
        steam: {
          id: req.user.id,
          username: req.user.displayName
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
        steam: null
      }
    })
  }
}
