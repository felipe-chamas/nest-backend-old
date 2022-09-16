import { Module } from '@nestjs/common'

import { DiscordController } from '@controllers/auth/discord.controller'
import { UserModule } from '@modules/user.module'
import { DiscordStrategy } from '@strategies/discord.strategy'

@Module({
  controllers: [DiscordController],
  imports: [UserModule],
  providers: [DiscordStrategy]
})
export class DiscordAuthModule {}
