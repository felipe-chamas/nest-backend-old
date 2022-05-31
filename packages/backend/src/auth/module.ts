import { Module } from '@nestjs/common';

import { SignatureAuthModule } from './providers';

@Module({
  imports: [SignatureAuthModule],
})
export class AuthModule {}
