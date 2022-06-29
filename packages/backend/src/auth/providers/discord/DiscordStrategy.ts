import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-discord';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { DiscordService } from './discord.service';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(
    private readonly discordService: DiscordService,
    private readonly config: ConfigService,
  ) {
    super({
      clientID: config.get<string>('discord.clientID'),
      clientSecret: config.get<string>('discord.clientSecret'),
      callbackURL: config.get<string>('discord.redirectURL'),
      passReqToCallback: true,
      tokenURL: 'https://discordapp.com/api/oauth2/token',
      scope: ['identify', 'email'],
    });
  }

  async validate(
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    if (!req.session.user)
      throw new UnauthorizedException('No user authenticated in session');
    return this.discordService.updateOrCreateUser(
      req.session,
      {
        id: profile.id,
        username: `${profile.username}#${profile.discriminator}`,
      },
      profile.email,
    );
  }
}
