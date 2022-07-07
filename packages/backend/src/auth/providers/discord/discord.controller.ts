import { Controller, Post, Session, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionData } from 'express-session';
import { UserService } from 'models/user';
import { DiscordService } from './discord.service';

@Controller('auth/discord')
export class DiscordController {
  constructor(
    private readonly discordService: DiscordService,
    private readonly userService: UserService,
  ) {}

  @Post('/link')
  @UseGuards(AuthGuard('discord'))
  async link(@Session() session: SessionData) {
    const user = await this.userService.findById(session.user.id);
    return user;
  }

  @Post('/unlink')
  async unlink(@Session() session: SessionData) {
    return this.discordService.deleteDiscordData(session);
  }
}
