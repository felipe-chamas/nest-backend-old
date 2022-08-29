import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MongoRepository } from 'typeorm';

import { CreateNftDto } from '../dto/create-nft.dto';
import { UpdateNftDto } from '../dto/update-nft.dto';

import { Nft } from 'common/entities';
import { Pagination } from 'common/decorators';
import { recoveryAgent } from 'common/utils';
import { AssetId } from 'caip';
import { ObjectId } from 'mongodb';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  ExternalApiNft,
  QuickNodeFetchNftsResponse,
  SolscanTokenAccountResponse,
} from '../types';
import { WalletService } from 'models/wallet/wallet.service';
import {
  NFTWalletBodyDto,
  PayableNFTWalletBodyDto,
  WalletBodyDto,
} from 'models/wallet/dto/create-wallet.dto';

import { MoralisNetworks } from 'common/types/caip';
import {
  MoralisResponseNftsByAddress,
  MorealisResultNftsByAddress,
  MoralisResposeSearchNft,
} from '../types/moralis';

@Injectable()
export class NftService {
  private readonly httpService = new HttpService();

  constructor(
    @InjectRepository(Nft)
    private readonly nftRepo: MongoRepository<Nft>,
    private readonly walletService: WalletService,
  ) {}

  async create(createNftDto: CreateNftDto) {
    const nft = this.nftRepo.create(createNftDto);
    await this.nftRepo.save(nft);
    return nft;
  }

  async findAll({ query, ...match }: Pagination & Partial<Nft>) {
    const [nfts] = await this.nftRepo
      .aggregate<Nft[]>([
        {
          $match: match,
        },
        {
          $addFields: {
            id: '$_id',
          },
        },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: query,
          },
        },
        {
          $project: {
            data: 1,
            total: { $arrayElemAt: ['$metadata.total', 0] },
          },
        },
      ])
      .toArray();

    return nfts;
  }

  async findByAddress(address: string): Promise<ExternalApiNft> {
    const SOLSCAN_PUBLIC_ENDPOINT = 'https://public-api.solscan.io';
    const endpoint = `${SOLSCAN_PUBLIC_ENDPOINT}/account/${address}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await firstValueFrom(
      this.httpService.get<SolscanTokenAccountResponse>(endpoint, config),
    );

    if (!response.data) return;

    const { data, collection } = response.data.metadata;
    return {
      name: data.name,
      collectionName: '',
      tokenAddress: data.mint,
      collectionAddress: collection.key,
      imageUrl: data.image,
      traits: data.attributes,
      chain: 'solana',
      network: 'mainnet',
      description: data.description,
    };
  }

  async findByContractAddressAndTokenIdEvm(
    chain: string,
    contractAddress: string,
    tokenId: string,
  ) {
    const url = `https://deep-index.moralis.io/api/v2/nft/${contractAddress}/${tokenId}`;

    const options = {
      method: 'GET',
      params: {
        chain: MoralisNetworks[chain].id,
        format: 'decimal',
      },
      headers: {
        Accept: 'application/json',
        'X-API-Key': process.env.MORALIS_API_KEY,
      },
    };

    const { data } =
      await this.httpService.axiosRef.get<MoralisResposeSearchNft>(
        url,
        options,
      );

    console.log(data);

    const metadata = JSON.parse(data.metadata);

    return {
      name: metadata.name,
      collectionName: '',
      collectionAddress: contractAddress,
      imageUrl: metadata.image,
      traits: metadata.attributes,
      chain: MoralisNetworks[chain].chain,
      network: MoralisNetworks[chain].name,
      description: metadata.description,
    };
  }

  async findAllBySolanaWallet(
    query,
    wallet: string,
  ): Promise<ExternalApiNft[]> {
    // TODO add pagination
    // TODO add filtering
    const endpoint = process.env.QUICKNODE_URI;

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const data = {
      jsonrpc: '2.0',
      id: 1,
      method: 'qn_fetchNFTs',
      params: {
        wallet: wallet,
        omitFields: ['provenance', 'creators'],
        page: query.page || 1,
        perPage: query.limit || 20,
      },
    };

    const response = await firstValueFrom(
      this.httpService.post<QuickNodeFetchNftsResponse>(endpoint, data, config),
    );

    if (!response.data.result)
      throw new NotFoundException(`Wallet with Public Key ${wallet} not found`);

    return response.data.result.assets;
  }

  async findAllByEvmWallet(
    address: string,
    network: string,
    collections: string[],
    page?: number,
    limit?: number,
    cursor?: string,
  ) {
    const url = `https://deep-index.moralis.io/api/v2/${address}/nft`;
    let result: MorealisResultNftsByAddress[];
    let lastCursor = '';

    if (!cursor && page && page > 1) {
      for (let callNumber = 0; callNumber < page; callNumber++) {
        const options = {
          method: 'GET',
          params: {
            chain: MoralisNetworks[network].id,
            limit: limit || 100,
            format: 'decimal',
            token_addresses: collections,
            cursor: lastCursor,
          },
          headers: {
            Accept: 'application/json',
            'X-API-Key': process.env.MORALIS_API_KEY,
          },
        };
        const { data } =
          await this.httpService.axiosRef.get<MoralisResponseNftsByAddress>(
            url,
            options,
          );

        lastCursor = data.cursor;
        result = data.result;
      }
    } else {
      const options = {
        method: 'GET',
        params: {
          chain: MoralisNetworks[network].id,
          limit: limit || 100,
          format: 'decimal',
          token_addresses: collections,
          cursor: cursor || '',
        },
        headers: {
          Accept: 'application/json',
          'X-API-Key': process.env.MORALIS_API_KEY,
        },
      };
      const { data } =
        await this.httpService.axiosRef.get<MoralisResponseNftsByAddress>(
          url,
          options,
        );
      result = data.result;
      lastCursor = data.cursor;
    }

    return result.map((token) => {
      const metadata = token.metadata ? JSON.parse(token.metadata) : {};
      return {
        name: metadata.name,
        collectionName: token.name,
        collectionAddress: collections.find(
          (address) => address.toLocaleLowerCase() === token.token_address,
        ),
        tokenAddress: token.token_id,
        imageUrl: metadata.image,
        traits: metadata.attributes,
        chain: MoralisNetworks[network].chain,
        network: MoralisNetworks[network].name,
        description: metadata.description,
        cursor: lastCursor,
      };
    });
  }

  async findById(id: string) {
    const [nft] = await this.nftRepo
      .aggregate<Nft>([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $addFields: {
            id: '$_id',
          },
        },
      ])
      .toArray();

    if (!nft) throw new NotFoundException(`NFT with id ${id} not found`);

    return nft;
  }

  async findByAssetId(assetId: AssetId) {
    const [nft] = await this.nftRepo
      .aggregate<Nft>([
        {
          $match: {
            accountIds: {
              $elemMatch: assetId.toJSON(),
            },
          },
        },
        {
          $addFields: {
            id: '$_id',
          },
        },
      ])
      .toArray();
    return nft;
  }

  async update(id: string, updateNftDto: UpdateNftDto) {
    const nft = await this.findById(id);
    const newNft = { ...nft, ...updateNftDto };
    return await this.nftRepo.save(newNft);
  }

  async remove(id: string) {
    const nft = await this.findById(id);
    return await this.nftRepo.softRemove(nft);
  }

  async recover(id?: string) {
    return await recoveryAgent(this.nftRepo, id);
  }

  async mint(body: WalletBodyDto) {
    return this.walletService.executeMint(body);
  }

  async unbox(body: NFTWalletBodyDto) {
    return this.walletService.executeUnbox(body);
  }

  async upgrade(body: PayableNFTWalletBodyDto) {
    return this.walletService.executeUpgrade(body);
  }
}
