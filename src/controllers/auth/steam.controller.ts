import {
  UnauthorizedException,
  Controller,
  Post,
  Get,
  Session,
  UseGuards,
  Req,
  Res
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request, Response } from 'express'
import { SessionData } from 'express-session'

import { SteamService } from '@services/auth/steam.service'

@Controller()
export class SteamController {
  constructor(private readonly steamService: SteamService) {}

  @Get('/link')
  @UseGuards(AuthGuard('steam'))
  async link() {
    return
  }

  @Get('/callback')
  @UseGuards(AuthGuard('steam'))
  async callback(@Req() req: Request, @Res() res: Response) {
    const queryString = Object.keys(req.user)
      .map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(req.user[key])
      })
      .join('&')
    res.redirect(`${process.env.FRONTEND_URL}/profile/settings?${queryString}`)
  }

  @Post('/save')
  async save(@Req() req: Request) {
    if (!req.session.user) throw new UnauthorizedException('No user authenticated in session')
    return this.steamService.updateOrCreateUser(req.session, {
      id: req.query.id as string,
      username: req.query.displayName as string
    })
  }

  @Post('/unlink')
  async unlink(@Session() session: SessionData) {
    return this.steamService.deleteSteamData(session)
  }
}
