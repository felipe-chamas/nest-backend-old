import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'models/user';

import url from 'url';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { AccessTokenResult, CreateWalletResult } from './types';

@Injectable()
export class WalletService {
  client_id: string;
  client_secret: string;
  application_id: string;

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

  async createWallet({ pincode, userId }: CreateWalletDto) {
    // TODO: Change to find by EpicId / SteamId
    const user = await this.userService.findById(userId);

    await this.getAccessToken();

    this.httpService.axiosRef.defaults.baseURL = this.apiBaseURL;

    // TODO: Replace BSC with IMX when available
    const {
      data: {
        result: { id: venlyWalletId },
      },
    } = await this.httpService.axiosRef.post<CreateWalletResult>('wallets', {
      pincode,
      identifier: userId,
      secretType: 'BSC',
      walletType: 'WHITE_LABEL',
    });

    return this.userService.update(userId, { ...user, venlyWalletId });
  }
}
