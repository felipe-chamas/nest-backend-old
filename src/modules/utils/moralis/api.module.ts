import { Module } from '@nestjs/common'
import { Axios } from 'axios'

import { HttpMoralisApiService } from '@services/utils/moralis/api.service'

export const AXIOS_INSTANCE_TOKEN = 'AXIOS_INSTANCE_TOKEN'

@Module({
  providers: [
    HttpMoralisApiService,
    {
      provide: AXIOS_INSTANCE_TOKEN,
      useValue: Axios
    }
  ],
  exports: [HttpMoralisApiService]
})
export class HttpMoralisApiModule {}
