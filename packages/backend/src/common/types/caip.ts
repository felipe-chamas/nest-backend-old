export interface ChainIdDto {
  namespace: string;
  reference: string;
}

export interface AssetNameDto {
  namespace: string;
  reference: string;
}

export interface AccountIdDto {
  chainId: ChainIdDto;
  address: string;
}

export interface AssetTypeDto {
  chainId: ChainIdDto;
  assetName: AssetNameDto;
}

export interface AssetIdDto {
  chainId: ChainIdDto;
  assetName: AssetNameDto;
  tokenId: string;
}

// Ref: EVM references based on list data - https://github.com/ethereum-lists/chains/tree/master/_data/chains
// Ref: Solana references based on GenesisHash - https://docs.solana.com/clusters
export enum ChainIdReference {
  ETHEREUM_MAINNET = 'eip155:1',
  GOERLI_TESTNET = 'eip155:5',
  BINANCE_MAINNET = 'eip155:56',
  BINANCE_TESTNET = 'eip155:97',
  SOLANA_TESTNET = 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
  SOLANA_DEVNET = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  SOLANA_MAINNET = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
}

interface IMorilisNetworks {
  [key: string]: {
    id: string;
    chain: string;
    name: string;
  };
}

export const MoralisNetworks: IMorilisNetworks = {
  [ChainIdReference.ETHEREUM_MAINNET]: {
    id: 'eth',
    chain: 'ETH',
    name: 'Ethereum Mainnet',
  },
  [ChainIdReference.GOERLI_TESTNET]: {
    id: 'goerli',
    chain: 'GoerliETH',
    name: 'Goerli Testnet',
  },
  [ChainIdReference.BINANCE_MAINNET]: {
    id: 'bsc',
    chain: 'BNB',
    name: 'Binance Smart Chain Mainnet',
  },
  [ChainIdReference.BINANCE_TESTNET]: {
    id: 'bsc%20testnet',
    chain: 'tBNB',
    name: 'Binance Smart Chain Testnet',
  },
};
Object.freeze(MoralisNetworks);
