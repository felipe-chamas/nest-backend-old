import { Module } from '@nestjs/common'
import { Axios } from 'axios'

import { HttpVenlyAuthService } from '@services/utils/venly/auth.service'

export const AXIOS_INSTANCE_TOKEN = 'AXIOS_INSTANCE_TOKEN'

@Module({
  providers: [
    HttpVenlyAuthService,
    {
      provide: AXIOS_INSTANCE_TOKEN,
      useValue: Axios
    }
  ],
  exports: [HttpVenlyAuthService]
})
export class HttpVenlyAuthModule {}
