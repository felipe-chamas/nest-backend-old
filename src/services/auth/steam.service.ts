import { Injectable } from '@nestjs/common'
import { SessionData } from 'express-session'

import { UserDto } from '@common/dto/entities/user.dto'
import { UserService } from '@services/user.service'

import type { SteamDetails } from '@common/types/steam'

@Injectable()
export class SteamService {
  constructor(private readonly userService: UserService) {}

  async updateOrCreateUser(session: SessionData, details: SteamDetails): Promise<UserDto> {
    const userWithId = await this.userService.findById(session.user.id)
    const user = await this.userService.update(session.user.id, {
      socialAccounts: {
        ...userWithId.socialAccounts,
        steam: details
      }
    })

    return user
  }

  async deleteSteamData(session: SessionData): Promise<UserDto | void> {
    const userWithId = await this.userService.findById(session.user.id)
    const user = await this.userService.update(session.user.id, {
      socialAccounts: {
        ...userWithId.socialAccounts,
        steam: null
      }
    })
    return user
  }
}
