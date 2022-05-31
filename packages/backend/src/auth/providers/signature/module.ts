import { Module } from '@nestjs/common';
import { UserModule } from 'models';
import { UserService } from 'models/user';
import { SignatureAuthController } from './controller';
import { SignatureAuthService } from './service';
import { SignatureStrategy } from './strategy';

@Module({
  controllers: [SignatureAuthController],
  imports: [UserModule],
  providers: [UserService, SignatureAuthService, SignatureStrategy],
})
export class SignatureAuthModule {}
