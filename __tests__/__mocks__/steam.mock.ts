import { AxiosDefaults, AxiosInstance } from 'axios'

import { HttpSteamApiService } from '@services/utils/steam/api.service'

export const mockSteamApiService: Partial<HttpSteamApiService> = {
  axiosRef: {
    defaults: {} as AxiosDefaults
  } as AxiosInstance
}
