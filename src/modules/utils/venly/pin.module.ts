import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { PinService } from '@services/utils/venly/pin.service'

import { VenlyModule } from '../venly.module'

@Module({
  imports: [ConfigModule, VenlyModule],
  providers: [PinService],
  exports: [PinService]
})
export class PinModule {}
