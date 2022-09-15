import { Module } from '@nestjs/common'

import { VenlyService } from '@services/utils/venly.service'

import { HttpVenlyApiModule } from './venly/api.module'
import { HttpVenlyAuthModule } from './venly/auth.module'

@Module({
  imports: [HttpVenlyApiModule, HttpVenlyAuthModule],
  providers: [VenlyService],
  exports: [VenlyService]
})
export class VenlyModule {}
