import { Module } from '@nestjs/common';
import { AuthController } from './controller';

import { SignatureAuthModule, DiscordModule } from './providers';
import { FractalAuthModule } from './providers/fractal';

@Module({
  controllers: [AuthController],
  imports: [SignatureAuthModule, DiscordModule, FractalAuthModule],
})
export class AuthModule {}
