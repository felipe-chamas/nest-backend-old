import { Controller, Post, Session, Body } from '@nestjs/common'
import { SessionData } from 'express-session'

import { LinkEpicDto } from '@common/dto/request.dto'
import { UserService } from '@services/user.service'
import { EpicStrategy } from '@strategies/epic.strategy'

@Controller()
export class EpicController {
  constructor(
    private readonly userService: UserService,
    private readonly epicStrategy: EpicStrategy
  ) {}

  @Post('link')
  async link(@Body() linkEpicBody: LinkEpicDto) {
    const userEpicData = await this.epicStrategy.validate(linkEpicBody.code)

    const user = await this.userService.findByUUID(linkEpicBody.userId)
    return this.userService.update(linkEpicBody.userId, {
      socialAccounts: {
        ...user.socialAccounts,
        epic: {
          id: userEpicData.accountId,
          username: userEpicData.displayName
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
        epic: null
      }
    })
  }
}
