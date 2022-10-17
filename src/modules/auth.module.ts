import { Module } from '@nestjs/common'

import { AuthController } from '../controllers/auth.controller'

import { DiscordAuthModule } from './auth/discord.module'
import { EpicAuthModule } from './auth/epic.module'
import { FractalAuthModule } from './auth/fractal.module'
import { SignatureAuthModule } from './auth/signature.module'
import { SteamAuthModule } from './auth/steam.module'

@Module({
  controllers: [AuthController],
  imports: [
    SignatureAuthModule,
    DiscordAuthModule,
    FractalAuthModule,
    SteamAuthModule,
    EpicAuthModule
  ]
})
export class AuthModule {}
