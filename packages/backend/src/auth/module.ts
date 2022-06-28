import { Module } from '@nestjs/common';
import { AuthController } from './controller';

import { SignatureAuthModule } from './providers';

@Module({
  controllers: [AuthController],
  imports: [SignatureAuthModule],
})
export class AuthModule {}
