import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

import { EpicResultAccessToken, EpicResultUserAccount } from '@common/types/epic'
@Injectable()
export class EpicStrategy {
  constructor(private readonly config: ConfigService) {}
  async validate(code: string) {
    const { access_token, account_id } = await this.requestAccessToken(code)

    const { data } = await axios.get<EpicResultUserAccount[]>(
      'https://api.epicgames.dev/epic/id/v1/accounts',
      {
        params: { accountId: account_id },
        headers: { Authorization: `Bearer ${access_token}` }
      }
    )
    return data[0]
  }

  async requestAccessToken(code: string) {
    const { data } = await axios.post<EpicResultAccessToken>(
      'https://api.epicgames.dev/epic/oauth/v1/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        deployment_id: this.config.get<string>('epic.deploymentID'),
        scope: 'basic_profile',
        code: code
      }),
      {
        auth: {
          username: this.config.get<string>('epic.clientID'),
          password: this.config.get<string>('epic.clientSecret')
        }
      }
    )
    const { access_token, account_id } = data
    return { access_token, account_id }
  }
}
