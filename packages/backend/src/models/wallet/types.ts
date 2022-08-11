import { WalletDto } from 'common/types/wallet';

export interface AccessTokenResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  session_state: string;
  scope: string;
  expires_in: number;
  refresh_expires_in: number;
  'not-before-policy': number;
}

export interface Wallet extends WalletDto {
  archived: boolean;
  primary: boolean;
  hasCustomPin: boolean;
  balance: {
    available: boolean;
    secretType: 'ETHEREUM' | 'BSC';
    balance: number;
    gasBalance: number;
    symbol: 'ETH' | 'BNB';
    gasSymbol: 'ETH' | 'BNB';
    rawBalance: string;
    rawGasBalance: string;
    decimals: number;
  };
}

export interface CreateWalletResult {
  success: boolean;
  result: Wallet;
}

export interface GetWalletResult {
  success: boolean;
  result: Wallet;
}

export interface MintResult {
  success: boolean;
  result: {
    transactionHash: string;
  };
}
