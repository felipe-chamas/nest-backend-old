export interface AccessTokenResult {
  access_token: string
  refresh_token: string
  token_type: string
  session_state: string
  scope: string
  expires_in: number
  refresh_expires_in: number
  'not-before-policy': number
}

export interface UpdatePin {
  success: boolean
  result: {
    id: string
    address: string
    walletType: string
    secretType: string
    createdAt: string
    archived: boolean
    alias: string
    description: string
    primary: boolean
    hasCustomPin: boolean
    identifier: string
    balance: {
      available: boolean
      secretType: string
      balance: number
      gasBalance: number
      symbol: string
      gasSymbol: string
      rawBalance: string
      rawGasBalance: string
      decimals: number
    }
  }
}
