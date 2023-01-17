import type { WalletDto } from '@common/dto/wallet.dto'

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

export interface Wallet extends WalletDto {
  archived: boolean
  primary: boolean
  hasCustomPin: boolean
  balance: {
    available: boolean
    secretType: 'ETHEREUM' | 'BSC'
    balance: number
    gasBalance: number
    symbol: 'ETH' | 'BNB'
    gasSymbol: 'ETH' | 'BNB'
    rawBalance: string
    rawGasBalance: string
    decimals: number
  }
}
interface NftAttributes {
  type: string
  name: string
  value: string
}
export interface NftData {
  id: string
  name: string
  description: string
  url: string
  imageUrl: string
  imagePreviewUrl: string
  imageThumbnailUrl: string
  animationUrls: string[]
  fungible: boolean
  contract: {
    name: string
    address: string
    symbol: string
    type: string
    verified: boolean
    premium: boolean
    categories: any[]
  }
  attributes: NftAttributes[]
  balance: number
  finalBalance: number
  transferFees: boolean
}

export interface CreateWalletResult {
  success: boolean
  result: Wallet
}

export interface GetWalletResult {
  success: boolean
  result: Wallet
}

export interface GetNftsResponse {
  success: boolean
  result: NftData[]
}

export interface MintResult {
  success: boolean
  result: {
    transactionHash: string
  }
}

export interface GetTxStatusResult {
  success: boolean
  result: {
    hash: string
    status: 'SUCCEEDED' | string
  }
}

export interface GetBalance {
  success: boolean
  result: {
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

export interface TransferNativeToken {
  success: boolean
  result: {
    transactionHash: string
  }
}
