import { AxiosDefaults, AxiosInstance } from 'axios'

import { HttpElixirApiService } from '@services/utils/elixir/api.service'

export const mockElixirApiService: Partial<HttpElixirApiService> = {
  axiosRef: {
    defaults: { headers: { common: {} } } as AxiosDefaults
  } as AxiosInstance
}
