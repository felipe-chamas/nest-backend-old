import { Module } from '@nestjs/common'

import { SteamController } from '@controllers/auth/steam.controller'
import { UserModule } from '@modules/user.module'
import { SteamService } from '@services/auth/steam.service'
import { SteamStrategy } from '@strategies/steam.strategy'

@Module({
  controllers: [SteamController],
  imports: [UserModule],
  providers: [SteamStrategy, SteamService]
})
export class SteamAuthModule {}
