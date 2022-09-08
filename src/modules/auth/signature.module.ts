import { Module } from '@nestjs/common'

import { SignatureAuthController } from '@controllers/auth/signature.controller'
import { UserModule } from '@modules/user.module'
import { SignatureAuthService } from '@services/auth/signature.service'
import { SignatureStrategy } from '@strategies/signature.strategy'

@Module({
  controllers: [SignatureAuthController],
  imports: [UserModule],
  providers: [SignatureAuthService, SignatureStrategy]
})
export class SignatureAuthModule {}
