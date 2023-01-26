import { Module } from '@nestjs/common'
import { Axios } from 'axios'

import { HttpElixirApiService } from '@services/utils/elixir/api.service'

export const AXIOS_INSTANCE_TOKEN = 'AXIOS_INSTANCE_TOKEN'

@Module({
  providers: [
    HttpElixirApiService,
    {
      provide: AXIOS_INSTANCE_TOKEN,
      useValue: Axios
    }
  ],
  exports: [HttpElixirApiService]
})
export class HttpElixirApiModule {}
