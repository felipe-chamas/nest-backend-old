import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from 'models';
import { UserService } from 'models/user';
import { FractalAuthController } from './controller';
import { FractalStrategy } from './strategy';

@Module({
  controllers: [FractalAuthController],
  imports: [UserModule, HttpModule],
  providers: [UserService, FractalStrategy],
})
export class FractalAuthModule {}
