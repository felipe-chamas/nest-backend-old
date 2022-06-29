import { Injectable } from '@nestjs/common';
import { UserService } from '../../../models/user';
import { User } from '../../../common/entities';
import { discordDetails } from './types';
import { SessionData } from 'express-session';

@Injectable()
export class DiscordService {
  constructor(private readonly userService: UserService) {}

  async updateOrCreateUser(
    session: SessionData,
    details: discordDetails,
    email: string,
  ): Promise<User> {
    const user = await this.userService.update(session.user.id, {
      discord: details,
      email,
    });

    return user;
  }

  async deleteDiscordData(session: SessionData): Promise<User | void> {
    const user = await this.userService.update(session.user.id, {
      discord: null,
    });
    return user;
  }
}
