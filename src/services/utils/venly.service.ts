import url from 'url'

import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { AssetId, AssetType } from 'caip'
import { plainToInstance } from 'class-transformer'

import { WalletServiceDto } from '@common/dto/venly.dto'
import { WalletDto } from '@common/dto/wallet.dto'
import { AssetIdDto } from '@common/types/caip'

import { NftUnboxingService } from './nftUnboxing.services'
import { HttpVenlyApiService } from './venly/api.service'
import { HttpVenlyAuthService } from './venly/auth.service'

import type {
  AccessTokenResult,
  CreateWalletResult,
  GetBalance,
  GetTxStatusResult,
  GetWalletResult,
  MintResult,
  TransferNativeToken
} from '@common/types/wallet'

@Injectable()
export class VenlyService {
  client_id: string
  client_secret: string
  application_id: string

  constructor(
    private readonly config: ConfigService,
    private readonly apiService: HttpVenlyApiService,
    private readonly authService: HttpVenlyAuthService,
    private readonly nftUnboxingService: NftUnboxingService
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

  async createWallet({ pincode, uuid }: WalletServiceDto) {
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

  async unbox(assetId: AssetIdDto) {
    await this.getAccessToken()

    const assetType = new AssetType({ assetName: assetId.assetName, chainId: assetId.chainId })
    const nftUnboxing = await this.nftUnboxingService.findByAssetType(assetType)
    if (!nftUnboxing) throw new NotFoundException(`asset can't be unboxed: ${assetType}`)
    const { nfts, tokenCount } = nftUnboxing

    const [walletId, pincode, unboxAddress] = [
      this.config.get('operator.walletId') as string,
      this.config.get('operator.walletPinCode') as string,
      this.config.get('unbox.contractAddress') as string
    ]

    const {
      data: {
        result: { transactionHash }
      }
    } = await this.apiService.axiosRef.post<MintResult>('transactions/execute', {
      pincode,
      transactionRequest: {
        walletId,
        type: 'CONTRACT_EXECUTION',
        to: unboxAddress,
        secretType: 'BSC',
        functionName: 'unbox',
        value: 0,
        inputs: [
          {
            type: 'uint256',
            value: assetId.tokenId
          },
          {
            type: 'address[]',
            value: nfts
          },
          {
            type: 'uint256[]',
            value: tokenCount
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

  async approveNft(
    walletId: string,
    pincode: string,
    nftAddress: string,
    tokenId: string,
    to: string
  ) {
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
        to: nftAddress,
        secretType: 'BSC',
        functionName: 'approve',
        value: 0,
        inputs: [
          {
            type: 'address',
            value: to
          },
          {
            type: 'uint256',
            value: tokenId
          }
        ]
      }
    })
    return transactionHash
  }

  async getBalance(walletId: string) {
    await this.getAccessToken()
    const {
      data: {
        result: { balance }
      }
    } = await this.apiService.axiosRef.get<GetBalance>(`wallets/${walletId}/balance`)

    return balance
  }

  async transferNativeToken(walletId: string, pincode: string, value: number, to: string) {
    await this.getAccessToken()
    const { data } = await this.apiService.axiosRef.post<TransferNativeToken>(
      `/transactions/execute`,
      {
        transactionRequest: {
          type: 'TRANSFER',
          walletId,
          to,
          secretType: 'BSC',
          value
        },
        pincode
      }
    )
    return data
  }

  async topUp(walletId: string, address: string) {
    const topuperId = this.config.get('topuper.id')
    const topuperMinBalance = this.config.get('topuper.minBalance')
    const topuperBalance = await this.getBalance(topuperId)

    if (topuperBalance < topuperMinBalance) {
      const message = `*Falco Backend Alert*: \n - *message:* Top up wallet reached minimum balance\n - *Actual Balance:* ${topuperBalance}\n - *Minimum Balance:* ${topuperMinBalance}\n`
      const stage = this.config.get('stage')
      if (stage === 'production') {
        const slackUrl = this.config.get('slack.slackUrl')
        await axios.post(slackUrl, {
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: message
              }
            }
          ]
        })
      } else {
        console.log(message)
      }
    }

    const userBalance = await this.getBalance(walletId)
    const userMinBalance = this.config.get('topuper.userMinBalance')

    if (userBalance < userMinBalance) {
      const refill = this.config.get('topuper.userRefill')
      if (topuperBalance < refill && userBalance < userMinBalance)
        throw new InternalServerErrorException(
          `can't top up user account.\n - user balance: ${userBalance} \n - topuper balance: ${topuperBalance}`
        )

      const pincode = this.config.get('topuper.pincode')
      const data = await this.transferNativeToken(topuperId, pincode, Number(refill), address)
      if (!data.success) throw new InternalServerErrorException('top up transaction failed')

      const waitTx = async () => {
        let txStatus = 'UNKNOWN'
        let count = 0
        return new Promise(async (resolve, reject) => {
          do {
            txStatus = await this.getTxStatus(data.result.transactionHash)
            count += 1
            await new Promise((resolve) => setTimeout(() => resolve(null), 2000))
          } while (txStatus === 'UNKNOWN' && count < 8)
          if (count >= 7) reject("can't get transaction status")
          resolve(txStatus)
        })
      }
      const txStatus = await waitTx()

      if (txStatus !== 'SUCCEEDED')
        throw new InternalServerErrorException('top up transaction failed')

      const waitTransfer = async () => {
        let balance = 0
        let count = 0
        return new Promise(async (resolve, reject) => {
          do {
            balance = await this.getBalance(walletId)
            count += 1
            await new Promise((resolve) => setTimeout(() => resolve(null), 2000))
          } while (balance < userMinBalance && count < 8)
          if (count >= 7) reject("user balance didn't update")
          resolve(balance)
        })
      }

      await waitTransfer()

      return txStatus
    }
  }
}
