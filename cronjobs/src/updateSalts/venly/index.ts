import axios from 'axios'

import getEnv from '../constants/env'

import { AccessTokenResult, UpdatePin } from './types'

const venlyUrl =
  getEnv('STAGE') === 'production'
    ? 'https://api-wallet.venly.io/api'
    : 'https://api-wallet-staging.venly.io/api'

async function getAccessToken() {
  const baseUrl =
    getEnv('STAGE') === 'production'
      ? 'https://login.venly.io'
      : 'https://login-staging.arkane.network'

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: getEnv('VENLY_CLIENT_ID'),
    client_secret: getEnv('VENLY_CLIENT_SECRET')
  })

  const url = baseUrl + '/auth/realms/Arkane/protocol/openid-connect/token'
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  const {
    data: { access_token: accessToken }
  } = await axios.post<AccessTokenResult>(url, body.toString(), config)

  return `Bearer ${accessToken}`
}

export async function updatePin(oldPin: string, newPin: string, walletId: string) {
  const accessToken = await getAccessToken()
  const url = venlyUrl + `/wallets/${walletId}`
  const config = {
    headers: {
      Authorization: accessToken
    }
  }
  const body = {
    pincode: oldPin,
    newPincode: newPin
  }

  const { data } = await axios.patch<UpdatePin>(url, body, config)
  return data
}
