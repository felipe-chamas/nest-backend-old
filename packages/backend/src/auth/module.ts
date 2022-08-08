import { Module } from '@nestjs/common';
import { AuthController } from './controller';

import {
  SignatureAuthModule,
  DiscordAuthModule,
  SteamAuthModule,
} from './providers';
import { FractalAuthModule } from './providers/fractal';

@Module({
  controllers: [AuthController],
  imports: [
    SignatureAuthModule,
    DiscordAuthModule,
    FractalAuthModule,
    SteamAuthModule,
  ],
})
export class AuthModule {}
