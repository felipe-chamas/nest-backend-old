import { Injectable } from '@nestjs/common';
import { UserService } from '../../../models/user';
import { User } from '../../../common/entities';
import { DiscordDetails } from './types';
import { SessionData } from 'express-session';

@Injectable()
export class DiscordService {
  constructor(private readonly userService: UserService) {}

  async updateOrCreateUser(
    session: SessionData,
    details: DiscordDetails,
    email: string,
  ): Promise<User> {
    const userWithId = await this.userService.findById(session.user.id);
    const user = await this.userService.update(session.user.id, {
      socialAccounts: {
        ...userWithId.socialAccounts,
        discord: details,
      },
      email,
    });

    return user;
  }

  async deleteDiscordData(session: SessionData): Promise<User | void> {
    const userWithId = await this.userService.findById(session.user.id);
    const user = await this.userService.update(session.user.id, {
      socialAccounts: {
        ...userWithId.socialAccounts,
        discord: null,
      },
    });
    return user;
  }
}
