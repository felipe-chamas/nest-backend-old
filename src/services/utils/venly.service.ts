import url from 'url'

import { HttpService } from '@nestjs/axios'
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AssetId, AssetType } from 'caip'
import { plainToInstance } from 'class-transformer'

import { WalletServiceDto } from '@common/dto/venly.dto'
import { WalletDto } from '@common/dto/wallet.dto'
import { logger } from '@common/providers/logger'
import { AssetIdDto } from '@common/types/caip'
import { Metadata } from '@common/types/metadata'

import { NftUnboxingService } from './nftUnboxing.service'
import { SlackService } from './slack/slack.service'
import { HttpVenlyApiService } from './venly/api.service'
import { HttpVenlyAuthService } from './venly/auth.service'

import type {
  AccessTokenResult,
  ContractReadResult,
  CreateWalletResult,
  GetBalance,
  GetTxStatusResult,
  GetWalletResult,
  MintResult,
  SignatureResult,
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
    private readonly httpService: HttpService,
    private readonly nftUnboxingService: NftUnboxingService,
    private readonly slackService: SlackService
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

  async unbox({
    assetId,
    operatorPincode,
    operatorWalletId
  }: {
    operatorPincode: string
    operatorWalletId: string
    assetId: AssetIdDto
  }) {
    await this.getAccessToken()

    const assetType = new AssetType({ assetName: assetId.assetName, chainId: assetId.chainId })
    const nftUnboxing = await this.nftUnboxingService.findByAssetType(assetType)
    if (!nftUnboxing) throw new NotFoundException(`asset can't be unboxed: ${assetType}`)
    const { nfts, tokenCount } = nftUnboxing

    const unboxAddress = this.config.get('contracts.unboxAddress') as string

    const {
      data: {
        result: { transactionHash }
      }
    } = await this.apiService.axiosRef.post<MintResult>('transactions/execute', {
      pincode: operatorPincode,
      transactionRequest: {
        walletId: operatorWalletId,
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
        await this.slackService.triggerAlert(message)
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

  async getContractName(contractAddress: string) {
    await this.getAccessToken()

    const {
      data: {
        result: [{ value: name }]
      }
    } = await this.apiService.axiosRef.post<ContractReadResult>('contracts/read', {
      secretType: 'BSC',
      walletAddress: '0x0000000000000000000000000000000000000000',
      contractAddress,
      functionName: 'name',
      outputs: [
        {
          type: 'string'
        }
      ]
    })

    return name
  }

  async getSpenderNonce(contractAddress: string, spender: string) {
    await this.getAccessToken()

    const {
      data: {
        result: [{ value: nonce }]
      }
    } = await this.apiService.axiosRef.post<ContractReadResult>('contracts/read', {
      secretType: 'BSC',
      walletAddress: '0x0000000000000000000000000000000000000000',
      contractAddress,
      functionName: 'nonces',
      inputs: [
        {
          type: 'address',
          value: spender
        }
      ],
      outputs: [
        {
          type: 'uint256'
        }
      ]
    })

    return nonce
  }

  async signOperatorPermit({
    operatorPincode,
    operatorWalletId,
    contractAddress,
    spender,
    allowedFunction,
    allowedParameters,
    deadline
  }: {
    operatorPincode: string
    operatorWalletId: string
    contractAddress: string
    spender: string
    allowedFunction: string
    allowedParameters: string
    deadline: number | string
  }) {
    await this.getAccessToken()

    logger.info('Contract: ', contractAddress)
    logger.info('Spender: ', spender)
    const name = await this.getContractName(contractAddress)
    logger.info('Name: ', name)
    const nonce = await this.getSpenderNonce(contractAddress, spender)
    logger.info('Nonce: ', nonce)
    const chainId = this.config.get('stage') === 'production' ? 56 : 97

    const {
      data: {
        result: { signature }
      }
    } = await this.apiService.axiosRef.post<SignatureResult>('signatures', {
      pincode: operatorPincode,
      signatureRequest: {
        type: 'EIP712',
        secretType: 'BSC',
        walletId: operatorWalletId,
        data: {
          types: {
            Permit: [
              { name: 'allowedFunction', type: 'bytes4' },
              { name: 'allowedParameters', type: 'bytes32' },
              { name: 'deadline', type: 'uint256' },
              { name: 'spender', type: 'address' },
              { name: 'nonce', type: 'uint256' }
            ],
            EIP712Domain: [
              {
                name: 'name',
                type: 'string'
              },
              {
                name: 'version',
                type: 'string'
              },
              {
                name: 'chainId',
                type: 'uint256'
              },
              {
                name: 'verifyingContract',
                type: 'address'
              }
            ]
          },
          primaryType: 'Permit',
          domain: {
            name,
            version: '1',
            chainId,
            verifyingContract: contractAddress
          },
          message: {
            allowedFunction,
            allowedParameters,
            deadline,
            spender,
            nonce
          }
        }
      }
    })

    logger.info('Sig: ', signature)

    return signature
  }

  async incrementMatches(pincode: string, walletId: string, data: string) {
    await this.getAccessToken()

    const sbtMatchesAddress = this.config.get('contracts.sbtMatchesAddress') as string

    const {
      data: {
        result: { transactionHash }
      }
    } = await this.apiService.axiosRef.post<MintResult>('transactions/execute', {
      pincode,
      transactionRequest: {
        walletId,
        type: 'CONTRACT_EXECUTION',
        to: sbtMatchesAddress,
        secretType: 'BSC',
        functionName: 'increment',
        value: 0,
        inputs: [
          {
            type: 'bytes',
            value: data
          }
        ]
      }
    })

    return transactionHash
  }

  async getUserMatchesMetadata(walletAddress: string) {
    await this.getAccessToken()

    const sbtMatchesAddress = this.config.get('contracts.sbtMatchesAddress') as string

    const {
      data: {
        result: [{ value: tokenId }]
      }
    } = await this.apiService.axiosRef.post<ContractReadResult>('contracts/read', {
      secretType: 'BSC',
      walletAddress: '0x0000000000000000000000000000000000000000',
      contractAddress: sbtMatchesAddress,
      functionName: 'tokenOfOwner',
      inputs: [
        {
          type: 'address',
          value: walletAddress
        }
      ],
      outputs: [
        {
          type: 'uint256'
        }
      ]
    })

    const {
      data: {
        result: [{ value: tokenURI }]
      }
    } = await this.apiService.axiosRef.post<ContractReadResult>('contracts/read', {
      secretType: 'BSC',
      walletAddress: '0x0000000000000000000000000000000000000000',
      contractAddress: sbtMatchesAddress,
      functionName: 'tokenURI',
      inputs: [
        {
          type: 'uint256',
          value: tokenId as number
        }
      ],
      outputs: [
        {
          type: 'string'
        }
      ]
    })

    const { data: metadata } = await this.httpService.axiosRef.get<Metadata>(tokenURI as string)
    return metadata
  }
}
