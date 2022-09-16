import { Module } from '@nestjs/common'

import { SteamController } from '@controllers/auth/steam.controller'
import { UserModule } from '@modules/user.module'
import { SteamStrategy } from '@strategies/steam.strategy'

@Module({
  controllers: [SteamController],
  imports: [UserModule],
  providers: [SteamStrategy]
})
export class SteamAuthModule {}
