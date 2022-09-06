import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { FractalAuthController } from '@controllers/auth/fractal.controller'
import { UserModule } from '@modules/user.module'
import { UserService } from '@services/user.service'
import { FractalStrategy } from '@strategies/fractal.strategy'

@Module({
  controllers: [FractalAuthController],
  imports: [UserModule, HttpModule],
  providers: [UserService, FractalStrategy]
})
export class FractalAuthModule {}
