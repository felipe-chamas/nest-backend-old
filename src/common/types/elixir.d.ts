export interface ElixirUserCredentials {
  code: number
  success: boolean
  data: {
    token: string
    tokenExpiry: number
    tokenLifeMS: number
    refreshToken: string
    user: {
      _id: string
      status: string
      banReason: string
    }
  }
}

export interface ElixirUserInfo {
  code: number
  success: boolean
  data: {
    sub: string
    wallets: string[] // These are written like so: 'CHAIN:WALLET', example: 'BINANCE:0xBCC...9d8'
    nickname: string
    picture?: string
    status: string
    aud: string
    iss: string
    iat: number
    exp: number
  }
}
