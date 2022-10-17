import { Module } from '@nestjs/common'

import { EpicController } from '@controllers/auth/epic.controller'
import { UserModule } from '@modules/user.module'
import { EpicStrategy } from '@strategies/epic.strategy'

@Module({
  controllers: [EpicController],
  imports: [UserModule],
  providers: [EpicStrategy]
})
export class EpicAuthModule {}
