import { Module } from '@nestjs/common'
import { Axios } from 'axios'

import { HttpVenlyApiService } from '@services/utils/venly/api.service'

export const AXIOS_INSTANCE_TOKEN = 'AXIOS_INSTANCE_TOKEN'

@Module({
  providers: [
    HttpVenlyApiService,
    {
      provide: AXIOS_INSTANCE_TOKEN,
      useValue: Axios
    }
  ],
  exports: [HttpVenlyApiService]
})
export class HttpVenlyApiModule {}
