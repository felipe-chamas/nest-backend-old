import { Injectable } from '@nestjs/common'
import { SessionData } from 'express-session'

import { UserDto } from '@common/dto/entities/user.dto'
import { UserService } from '@services/user.service'

import type { DiscordDetails } from '@common/types/discord'

@Injectable()
export class DiscordService {
  constructor(private readonly userService: UserService) {}

  async updateOrCreateUser(
    session: SessionData,
    details: DiscordDetails,
    email: string
  ): Promise<UserDto> {
    const userWithId = await this.userService.findById(session.user.id)
    const user = await this.userService.update(session.user.id, {
      socialAccounts: {
        ...userWithId.socialAccounts,
        discord: details
      },
      email
    })

    return user
  }

  async deleteDiscordData(session: SessionData): Promise<UserDto | void> {
    const userWithId = await this.userService.findById(session.user.id)
    const user = await this.userService.update(session.user.id, {
      socialAccounts: {
        ...userWithId.socialAccounts,
        discord: null
      }
    })
    return user
  }
}
