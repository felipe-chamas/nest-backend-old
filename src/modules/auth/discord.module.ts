import { Module } from '@nestjs/common'

import { DiscordController } from '@controllers/auth/discord.controller'
import { UserModule } from '@modules/user.module'
import { DiscordService } from '@services/auth/discord.service'
import { UserService } from '@services/user.service'
import { DiscordStrategy } from '@strategies/discord.strategy'

@Module({
  controllers: [DiscordController],
  imports: [UserModule],
  providers: [DiscordStrategy, DiscordService, UserService]
})
export class DiscordAuthModule {}
