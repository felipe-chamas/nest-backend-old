import { Injectable } from '@nestjs/common';
import { UserService } from '../../../models/user';
import { User } from '../../../common/entities';
import { SteamDetails } from './types';
import { SessionData } from 'express-session';

@Injectable()
export class SteamService {
  constructor(private readonly userService: UserService) {}

  async updateOrCreateUser(
    session: SessionData,
    details: SteamDetails,
  ): Promise<User> {
    const userWithId = await this.userService.findById(session.user.id);
    const user = await this.userService.update(session.user.id, {
      socialAccounts: {
        ...userWithId.socialAccounts,
        steam: details,
      },
    });

    return user;
  }

  async deleteSteamData(session: SessionData): Promise<User | void> {
    const userWithId = await this.userService.findById(session.user.id);
    const user = await this.userService.update(session.user.id, {
      socialAccounts: {
        ...userWithId.socialAccounts,
        steam: null,
      },
    });
    return user;
  }
}
