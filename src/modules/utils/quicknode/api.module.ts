import { Module } from '@nestjs/common'
import { Axios } from 'axios'

import { HttpQuicknodeApiService } from '@services/utils/quicknode/api.service'

export const AXIOS_INSTANCE_TOKEN = 'AXIOS_INSTANCE_TOKEN'

@Module({
  providers: [
    HttpQuicknodeApiService,
    {
      provide: AXIOS_INSTANCE_TOKEN,
      useValue: Axios
    }
  ],
  exports: [HttpQuicknodeApiService]
})
export class HttpQuicknodeApiModule {}
