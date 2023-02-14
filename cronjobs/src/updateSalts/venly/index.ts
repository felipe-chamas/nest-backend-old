import axios from 'axios'
import { Redis } from 'ioredis'

import getEnv from '../constants/env'
import { generateNewSalt, calculatePin } from '../pin'

import { AccessTokenResult, Archive, Balance, GetNfts, NewWallet, UpdatePin } from './types'

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
  const url = venlyUrl + `/wallets/${walletId}/security`
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

export async function archiveWallet(walletId: string) {
  const accessToken = await getAccessToken()
  const url = venlyUrl + `/wallets/${walletId}`
  const config = {
    headers: {
      Authorization: accessToken
    }
  }
  const body = {
    archived: true
  }

  const { data } = await axios.patch<Archive>(url, body, config)
  return data
}

export async function getNftsCount(walletId: string) {
  const accessToken = await getAccessToken()
  const url = venlyUrl + `/wallets/${walletId}/nonfungibles`
  const config = {
    headers: {
      Authorization: accessToken
    }
  }

  const { data } = await axios.get<GetNfts>(url, config)
  return data.result.length
}

export async function getWalletBalance(walletId: string) {
  const accessToken = await getAccessToken()
  const url = venlyUrl + `/wallets/${walletId}/balance`
  const config = {
    headers: {
      Authorization: accessToken
    }
  }

  const { data } = await axios.get<Balance>(url, config)
  return data.result.balance
}

export async function createWallet(uuid: string, redis: Redis) {
  const salt = generateNewSalt()
  const pincode = calculatePin(uuid, salt)

  const accessToken = await getAccessToken()
  const url = venlyUrl + `/wallets/`
  const config = {
    headers: {
      Authorization: accessToken
    }
  }
  const body = {
    pincode,
    identifier: uuid,
    secretType: 'BSC',
    walletType: 'WHITE_LABEL'
  }

  const {
    data: {
      result: { id, address, walletType, secretType, identifier, description, createdAt }
    }
  } = await axios.post<NewWallet>(url, body, config)

  await redis.set(uuid, salt)

  return {
    id,
    address,
    walletType,
    secretType,
    identifier,
    description,
    createdAt
  }
}
