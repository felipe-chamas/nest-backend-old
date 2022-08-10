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

export interface CreateWalletResult {
  success: boolean;
  result: {
    id: string;
    address: string;
    walletType: 'UNRECOVERABLE_WHITE_LABEL' | 'WHITE_LABEL';
    secretType: 'ETHEREUM' | 'BSC';
    createdAt: string;
    archived: boolean;
    description: string;
    primary: boolean;
    hasCustomPin: boolean;
    identifier: string;
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
  };
}
