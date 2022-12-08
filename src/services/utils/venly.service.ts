import url from 'url'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AssetId, AssetType } from 'caip'
import { plainToInstance } from 'class-transformer'

import { WalletBodyDto } from '@common/dto/venly.dto'
import { WalletDto } from '@common/dto/wallet.dto'
import { AssetIdDto } from '@common/types/caip'

import { HttpVenlyApiService } from './venly/api.service'
import { HttpVenlyAuthService } from './venly/auth.service'

import type {
  AccessTokenResult,
  CreateWalletResult,
  GetTxStatusResult,
  GetWalletResult,
  MintResult
} from '@common/types/wallet'

@Injectable()
export class VenlyService {
  client_id: string
  client_secret: string
  application_id: string

  constructor(
    private readonly config: ConfigService,
    private readonly apiService: HttpVenlyApiService,
    private readonly authService: HttpVenlyAuthService
  ) {
    this.client_id = this.config.get('venly.client_id')
    this.client_secret = this.config.get('venly.client_secret')
    this.application_id = this.config.get('venly.application_id')

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

  async createWallet({ pincode, uuid }: WalletBodyDto) {
    await this.getAccessToken()

    const {
      data: { result }
    } = await this.apiService.axiosRef.post<CreateWalletResult>('wallets', {
      pincode,
      identifier: uuid,
      secretType: 'BSC',
      walletType: 'WHITE_LABEL'
    })

    const wallet = plainToInstance(WalletDto, result)
    return wallet
  }

  async mint({
    pincode,
    walletId,
    walletAddress,
    assetType
  }: {
    pincode: string
    walletId: string
    walletAddress: string
    assetType: AssetType
  }) {
    await this.getAccessToken()

    const nftCollectionAddress = assetType.assetName.reference

    const {
      data: {
        result: { transactionHash }
      }
    } = await this.apiService.axiosRef.post<MintResult>('transactions/execute', {
      pincode,
      transactionRequest: {
        walletId,
        type: 'CONTRACT_EXECUTION',
        to: nftCollectionAddress,
        secretType: 'BSC',
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
        secretType: 'BSC',
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
        secretType: 'BSC',
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

  async transfer(
    from: string,
    to: string,
    assetIds: AssetIdDto[],
    pincode: string,
    walletId: string
  ) {
    const contractToTokenIds = assetIds.reduce((acc, assetId) => {
      const address = assetId.assetName.reference
      const id = assetId.tokenId

      return { ...acc, [address]: [...(acc[address] || []), id] }
    }, {})

    await this.getAccessToken()

    const promiseArr = Object.keys(contractToTokenIds).map((address) => {
      const isSingle = contractToTokenIds[address].length === 1
      return this.apiService.axiosRef.post<MintResult>('transactions/execute', {
        pincode,
        transactionRequest: {
          walletId,
          type: 'CONTRACT_EXECUTION',
          to: address,
          secretType: 'BSC',
          functionName: isSingle ? 'transferFrom' : 'batchTransfer',
          value: 0,
          inputs: [
            {
              type: 'address',
              value: from
            },
            {
              type: 'address',
              value: to
            },
            {
              type: isSingle ? 'uint256' : 'uint256[]',
              value: isSingle ? contractToTokenIds[address][0] : contractToTokenIds[address]
            }
          ]
        }
      })
    })

    const responses = await Promise.all(promiseArr)
    return responses.map((response) => response.data.result.transactionHash)
  }

  async getTxStatus(transactionHash: string) {
    await this.getAccessToken()

    const {
      data: {
        result: { status }
      }
    } = await this.apiService.axiosRef.get<GetTxStatusResult>(
      `transactions/BSC/${transactionHash}/status`
    )

    return status
  }

  async archiveWallet(walletId: string) {
    await this.getAccessToken()

    const {
      data: { result }
    } = await this.apiService.axiosRef.patch<GetWalletResult>(`wallets/${walletId}`, {
      archived: true
    })

    return result
  }
}
