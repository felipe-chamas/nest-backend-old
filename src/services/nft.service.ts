import { HttpService } from '@nestjs/axios'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AssetId } from 'caip'
import { DeleteResult, UpdateResult } from 'mongodb'
import { SoftDeleteModel } from 'mongoose-delete'
import { firstValueFrom } from 'rxjs'

import { Pagination } from '@common/decorators/pagination.decorators'
import { CreateNftDto } from '@common/dto/create-nft.dto'
import {
  NFTWalletBodyDto,
  PayableNFTWalletBodyDto,
  WalletBodyDto
} from '@common/dto/create-wallet.dto'
import { UpdateNftDto } from '@common/dto/update-nft.dto'
import { MoralisNetworks } from '@common/enums/caip.enum'
import { logger } from '@common/providers/logger'
import { NftDocument, NftDto } from '@common/schemas/nft.schema'
import { WalletService } from '@services/wallet.service'

import type { Metadata } from '@common/types/metadata'
import type {
  MoralisResponseNftsByAddress,
  MoralisResultNftsByAddress,
  MoralisResponseSearchNft
} from '@common/types/moralis'
import type {
  ExternalApiNft,
  QuickNodeFetchNftsResponse,
  SolscanTokenAccountResponse
} from '@common/types/quicknode'

@Injectable()
export class NftService {
  private readonly httpService = new HttpService()

  constructor(
    @InjectModel(NftDto.name) private nftModel: SoftDeleteModel<NftDocument>,
    private readonly walletService: WalletService
  ) {}

  async create(createNftDto: CreateNftDto) {
    const nft = new this.nftModel(createNftDto)
    await nft.save()
    return nft
  }

  async findAll({ skip, limit, sort, ...match }: Pagination & Partial<NftDto>) {
    const data = await this.nftModel.find(match).sort(sort).skip(skip).limit(limit).exec()
    const total = await this.nftModel.find(match).count()
    return { data, total }
  }

  async findByAddress(address: string): Promise<ExternalApiNft> {
    const SOLSCAN_PUBLIC_ENDPOINT = 'https://public-api.solscan.io'
    const endpoint = `${SOLSCAN_PUBLIC_ENDPOINT}/account/${address}`

    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const response = await firstValueFrom(
      this.httpService.get<SolscanTokenAccountResponse>(endpoint, config)
    )

    if (!response.data) return

    const { data, collection } = response.data.metadata
    return {
      name: data.name,
      collectionName: '',
      tokenAddress: data.mint,
      collectionAddress: collection.key,
      imageUrl: data.image,
      traits: data.attributes,
      chain: 'solana',
      network: 'mainnet',
      description: data.description
    }
  }

  async findByContractAddressAndTokenIdEvm(
    chain: string,
    contractAddress: string,
    tokenId: string
  ) {
    const url = `https://deep-index.moralis.io/api/v2/nft/${contractAddress}/${tokenId}`

    const options = {
      method: 'GET',
      params: {
        chain: MoralisNetworks[chain].id,
        format: 'decimal'
      },
      headers: {
        Accept: 'application/json',
        'X-API-Key': process.env.MORALIS_API_KEY
      }
    }

    const { data } = await this.httpService.axiosRef.get<MoralisResponseSearchNft>(url, options)

    logger.info(data)

    const metadata = data.metadata
      ? JSON.parse(data.metadata)
      : (await this.httpService.axiosRef.get<Metadata>(data.token_uri)).data

    return {
      name: metadata.name,
      collectionName: '',
      collectionAddress: contractAddress,
      imageUrl: metadata.image,
      traits: metadata.attributes,
      chain: MoralisNetworks[chain].chain,
      network: MoralisNetworks[chain].name,
      description: metadata.description
    }
  }

  async findAllBySolanaWallet(query, wallet: string): Promise<ExternalApiNft[]> {
    // TODO add pagination
    // TODO add filtering
    const endpoint = process.env.QUICKNODE_URI

    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const data = {
      jsonrpc: '2.0',
      id: 1,
      method: 'qn_fetchNFTs',
      params: {
        wallet: wallet,
        omitFields: ['provenance', 'creators'],
        page: query.page || 1,
        perPage: query.limit || 20
      }
    }

    const response = await firstValueFrom(
      this.httpService.post<QuickNodeFetchNftsResponse>(endpoint, data, config)
    )

    if (!response.data.result)
      throw new NotFoundException(`Wallet with Public Key ${wallet} not found`)

    return response.data.result.assets
  }

  async findAllByEvmWallet(
    address: string,
    network: string,
    collections: string[],
    page?: number,
    limit?: number,
    cursor?: string
  ) {
    const url = `https://deep-index.moralis.io/api/v2/${address}/nft`
    let result: MoralisResultNftsByAddress[]
    let lastCursor = ''

    if (!cursor && page && page > 1) {
      for (let callNumber = 0; callNumber < page; callNumber++) {
        const options = {
          method: 'GET',
          params: {
            chain: MoralisNetworks[network].id,
            limit: limit || 100,
            format: 'decimal',
            token_addresses: collections,
            cursor: lastCursor
          },
          headers: {
            Accept: 'application/json',
            'X-API-Key': process.env.MORALIS_API_KEY
          }
        }
        const { data } = await this.httpService.axiosRef.get<MoralisResponseNftsByAddress>(
          url,
          options
        )

        lastCursor = data.cursor
        result = data.result
      }
    } else {
      const options = {
        method: 'GET',
        params: {
          chain: MoralisNetworks[network].id,
          limit: limit || 100,
          format: 'decimal',
          token_addresses: collections,
          cursor: cursor || ''
        },
        headers: {
          Accept: 'application/json',
          'X-API-Key': process.env.MORALIS_API_KEY
        }
      }
      const { data } = await this.httpService.axiosRef.get<MoralisResponseNftsByAddress>(
        url,
        options
      )
      result = data.result
      lastCursor = data.cursor
    }

    return Promise.all(
      result.map(async (token) => {
        const metadata = token.metadata
          ? JSON.parse(token.metadata)
          : (await this.httpService.axiosRef.get<Metadata>(token.token_uri)).data

        return {
          name: metadata.name,
          collectionName: token.name,
          collectionAddress: collections.find(
            (address) => address.toLocaleLowerCase() === token.token_address
          ),
          tokenAddress: token.token_id,
          imageUrl: metadata.image,
          traits: metadata.attributes,
          chain: MoralisNetworks[network].chain,
          network: MoralisNetworks[network].name,
          description: metadata.description,
          cursor: lastCursor
        }
      })
    )
  }

  async findById(id: string) {
    const nft = await this.nftModel.findById(id).exec()
    return nft
  }

  async findByAssetId(assetId: AssetId) {
    const [nft] = await this.nftModel.find().elemMatch('assetIds', assetId.toJSON()).exec()
    return nft
  }

  async update(id: string, update: UpdateNftDto) {
    const nft = await this.nftModel.findByIdAndUpdate(id, update).exec()
    return nft
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.nftModel.deleteById(id).exec()
  }

  async recover(id?: string): Promise<UpdateResult> {
    return await this.nftModel.restore({ _id: id }).exec()
  }

  async mint(body: WalletBodyDto) {
    return this.walletService.executeMint(body)
  }

  async unbox(body: NFTWalletBodyDto) {
    return this.walletService.executeUnbox(body)
  }

  async upgrade(body: PayableNFTWalletBodyDto) {
    return this.walletService.executeUpgrade(body)
  }
}
