import { Module } from '@nestjs/common';
import { AuthController } from './controller';

import { SignatureAuthModule, DiscordModule } from './providers';

@Module({
  controllers: [AuthController],
  imports: [SignatureAuthModule, DiscordModule],
})
export class AuthModule {}
