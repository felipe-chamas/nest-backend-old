import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssetId } from 'caip';
import { plainToInstance } from 'class-transformer';
import { WalletDto } from 'common/types/wallet';
import { UserService } from 'models/user';

import url from 'url';
import {
  NFTWalletBodyDto,
  PayableNFTWalletBodyDto,
  WalletBodyDto,
} from './dto/create-wallet.dto';
import {
  AccessTokenResult,
  CreateWalletResult,
  GetWalletResult,
  MintResult,
} from './types';

@Injectable()
export class WalletService {
  client_id: string;
  client_secret: string;
  application_id: string;

  nftCollectionAddress: string;

  private readonly authBaseURL: string;
  private readonly apiBaseURL: string;

  private readonly httpService = new HttpService();

  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
  ) {
    this.client_id = this.config.get('venly.client_id');
    this.client_secret = this.config.get('venly.client_secret');
    this.application_id = this.config.get('venly.application_id');

    this.authBaseURL =
      this.config.get('stage') === 'production'
        ? 'https://login.venly.io'
        : 'https://login-staging.arkane.network';
    this.apiBaseURL =
      this.config.get('stage') === 'production'
        ? 'https://api-wallet.venly.io/api'
        : 'https://api-wallet-staging.venly.io/api';

    // TODO: input production address once deployed
    // TODO: change testnet address once deployed in IMX
    this.nftCollectionAddress =
      this.config.get('stage') === 'production'
        ? ''
        : '0x83269feb3c2e078cd364b69b3a76c51074e45cfa';
  }

  async getAccessToken() {
    const params = new url.URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.client_id,
      client_secret: this.client_secret,
    });
    this.httpService.axiosRef.defaults.baseURL = this.authBaseURL;

    const {
      data: { access_token: accessToken },
    } = await this.httpService.axiosRef.post<AccessTokenResult>(
      'auth/realms/Arkane/protocol/openid-connect/token',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    this.httpService.axiosRef.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }

  async getWallet(walletId: string) {
    await this.getAccessToken();

    this.httpService.axiosRef.defaults.baseURL = this.apiBaseURL;

    const {
      data: { result },
    } = await this.httpService.axiosRef.get<GetWalletResult>(
      `wallets/${walletId}`,
    );

    return result;
  }

  async createWallet({ pincode, userId }: WalletBodyDto) {
    // TODO: Change to find by EpicId / SteamId
    const user = await this.userService.findById(userId);

    await this.getAccessToken();

    this.httpService.axiosRef.defaults.baseURL = this.apiBaseURL;

    // TODO: Replace BSC with IMX when available
    const {
      data: { result },
    } = await this.httpService.axiosRef.post<CreateWalletResult>('wallets', {
      pincode,
      identifier: userId,
      secretType: 'BSC',
      walletType: 'WHITE_LABEL',
    });

    const wallet = plainToInstance(WalletDto, result);

    return this.userService.update(userId, { ...user, wallet });
  }

  async executeMint({ pincode, userId }: WalletBodyDto) {
    // TODO: Change to find by EpicId / SteamId
    const user = await this.userService.findById(userId);

    if (!user.wallet) throw new BadRequestException('User has no wallet');

    await this.getAccessToken();

    this.httpService.axiosRef.defaults.baseURL = this.apiBaseURL;

    const {
      data: {
        result: { transactionHash },
      },
    } = await this.httpService.axiosRef.post<MintResult>(
      'transactions/execute',
      {
        pincode,
        transactionRequest: {
          walletId: user.wallet.id,
          type: 'CONTRACT_EXECUTION',
          to: this.nftCollectionAddress,
          secretType: 'BSC',
          functionName: 'mint',
          value: 0,
          inputs: [
            {
              type: 'address',
              value: user.wallet.address,
            },
          ],
        },
      },
    );

    return transactionHash;
  }

  async executeUnbox({ pincode, userId, assetId }: NFTWalletBodyDto) {
    // TODO: Change to find by EpicId / SteamId
    const user = await this.userService.findById(userId);

    if (!user.wallet) throw new BadRequestException('User has no wallet');

    await this.getAccessToken();

    this.httpService.axiosRef.defaults.baseURL = this.apiBaseURL;

    const caipAssetId = new AssetId(assetId);

    // TODO: Check on input parameters after Smart Contract refactor
    const {
      data: {
        result: { transactionHash },
      },
    } = await this.httpService.axiosRef.post<MintResult>(
      'transactions/execute',
      {
        pincode,
        transactionRequest: {
          walletId: user.wallet.id,
          type: 'CONTRACT_EXECUTION',
          to: caipAssetId.assetName.reference,
          secretType: 'BSC',
          functionName: 'unbox',
          value: 0,
          inputs: [
            {
              type: 'uint256',
              value: caipAssetId.tokenId,
            },
          ],
        },
      },
    );

    return transactionHash;
  }

  async executeUpgrade({
    pincode,
    userId,
    assetId,
    value,
  }: PayableNFTWalletBodyDto) {
    // TODO: Change to find by EpicId / SteamId
    const user = await this.userService.findById(userId);

    if (!user.wallet) throw new BadRequestException('User has no wallet');

    await this.getAccessToken();

    this.httpService.axiosRef.defaults.baseURL = this.apiBaseURL;

    const caipAssetId = new AssetId(assetId);

    // TODO: Check on input parameters after Smart Contract refactor
    const {
      data: {
        result: { transactionHash },
      },
    } = await this.httpService.axiosRef.post<MintResult>(
      'transactions/execute',
      {
        pincode,
        transactionRequest: {
          walletId: user.wallet.id,
          type: 'CONTRACT_EXECUTION',
          to: caipAssetId.assetName.reference,
          secretType: 'BSC',
          functionName: 'upgrade',
          value,
          inputs: [
            {
              type: 'uint256',
              value: caipAssetId.tokenId,
            },
          ],
        },
      },
    );

    return transactionHash;
  }
}
