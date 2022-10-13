import url from 'url'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AssetId } from 'caip'
import { plainToInstance } from 'class-transformer'

import { WalletBodyDto } from '@common/dto/venly.dto'
import { WalletDto } from '@common/dto/wallet.dto'

import { HttpVenlyApiService } from './venly/api.service'
import { HttpVenlyAuthService } from './venly/auth.service'

import type {
  AccessTokenResult,
  CreateWalletResult,
  GetWalletResult,
  MintResult
} from '@common/types/wallet'

@Injectable()
export class VenlyService {
  client_id: string
  client_secret: string
  application_id: string

  nftCollectionAddress: string

  constructor(
    private readonly config: ConfigService,
    private readonly apiService: HttpVenlyApiService,
    private readonly authService: HttpVenlyAuthService
  ) {
    this.client_id = this.config.get('venly.client_id')
    this.client_secret = this.config.get('venly.client_secret')
    this.application_id = this.config.get('venly.application_id')

    // TODO: input production address once deployed
    // TODO: change testnet address once deployed in MATIC
    this.nftCollectionAddress =
      this.config.get('stage') === 'production' ? '' : '0x83269feb3c2e078cd364b69b3a76c51074e45cfa'

    this.apiService.axiosRef.defaults.baseURL =
      this.config.get('stage') === 'production'
        ? 'https://api-wallet.venly.io/api'
        : 'https://api-wallet-staging.venly.io/api'

    this.authService.axiosRef.defaults.baseURL =
      this.config.get('stage') === 'production'
        ? 'https://login.venly.io'
        : 'https://login-staging.arkane.network'
  }

  async getAccessToken() {
    const params = new url.URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.client_id,
      client_secret: this.client_secret
    })

    const {
      data: { access_token: accessToken }
    } = await this.authService.axiosRef.post<AccessTokenResult>(
      'auth/realms/Arkane/protocol/openid-connect/token',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    this.apiService.axiosRef.defaults.headers.common.Authorization = `Bearer ${accessToken}`
  }

  async getWallet(walletId: string) {
    await this.getAccessToken()
    const {
      data: { result }
    } = await this.apiService.axiosRef.get<GetWalletResult>(`wallets/${walletId}`)
    return result
  }

  async getTokenBalance({ walletId, token }) {
    await this.getAccessToken()
    const {
      data: { result }
    } = await this.apiService.axiosRef.get<GetWalletResult>(
      token ? `wallets/${walletId}/balance/tokens/${token}` : `wallets/${walletId}/balance/tokens`
    )
    return result
  }

  async getNfts({ walletId, nfts }) {
    await this.getAccessToken()
    const {
      data: { result }
    } = await this.apiService.axiosRef.get<GetWalletResult>(`wallets/${walletId}/nonfungibles`, {
      params: {
        'contract-addresses': nfts
      }
    })
    return result
  }

  async createWallet({ pincode, uuid }: WalletBodyDto) {
    await this.getAccessToken()

    const {
      data: { result }
    } = await this.apiService.axiosRef.post<CreateWalletResult>('wallets', {
      pincode,
      identifier: uuid,
      secretType: 'MATIC',
      walletType: 'WHITE_LABEL'
    })

    const wallet = plainToInstance(WalletDto, result)
    return wallet
  }

  async mint({ pincode, walletId, walletAddress }) {
    await this.getAccessToken()

    const {
      data: {
        result: { transactionHash }
      }
    } = await this.apiService.axiosRef.post<MintResult>('transactions/execute', {
      pincode,
      transactionRequest: {
        walletId,
        type: 'CONTRACT_EXECUTION',
        to: this.nftCollectionAddress,
        secretType: 'MATIC',
        functionName: 'mint',
        value: 0,
        inputs: [
          {
            type: 'address',
            value: walletAddress
          }
        ]
      }
    })

    return transactionHash
  }

  async unbox({ pincode, walletId, assetId }) {
    await this.getAccessToken()

    const caipAssetId = new AssetId(assetId)

    const {
      data: {
        result: { transactionHash }
      }
    } = await this.apiService.axiosRef.post<MintResult>('transactions/execute', {
      pincode,
      transactionRequest: {
        walletId,
        type: 'CONTRACT_EXECUTION',
        to: caipAssetId.assetName.reference,
        secretType: 'MATIC',
        functionName: 'unbox',
        value: 0,
        inputs: [
          {
            type: 'uint256',
            value: caipAssetId.tokenId
          }
        ]
      }
    })

    return transactionHash
  }

  async upgrade({ pincode, walletId, assetId, value }) {
    await this.getAccessToken()

    const caipAssetId = new AssetId(assetId)

    const {
      data: {
        result: { transactionHash }
      }
    } = await this.apiService.axiosRef.post<MintResult>('transactions/execute', {
      pincode,
      transactionRequest: {
        walletId,
        type: 'CONTRACT_EXECUTION',
        to: caipAssetId.assetName.reference,
        secretType: 'MATIC',
        functionName: 'upgrade',
        value,
        inputs: [
          {
            type: 'uint256',
            value: caipAssetId.tokenId
          }
        ]
      }
    })

    return transactionHash
  }

  async ArchiveWallet(walletId: string) {
    await this.getAccessToken()

    const {
      data: { result }
    } = await this.apiService.axiosRef.patch<GetWalletResult>(`wallets/${walletId}`, {
      archived: true
    })

    return result
  }
}
