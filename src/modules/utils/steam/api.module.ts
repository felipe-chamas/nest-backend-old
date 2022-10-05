import { Module } from '@nestjs/common'
import { Axios } from 'axios'

import { HttpSteamApiService } from '@services/utils/steam/api.service'

export const AXIOS_INSTANCE_TOKEN = 'AXIOS_INSTANCE_TOKEN'

@Module({
  providers: [
    HttpSteamApiService,
    {
      provide: AXIOS_INSTANCE_TOKEN,
      useValue: Axios
    }
  ],
  exports: [HttpSteamApiService]
})
export class HttpSteamApiModule {}
