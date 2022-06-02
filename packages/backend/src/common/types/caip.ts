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

// Ref: Solana reference based on GenesisHash - https://docs.solana.com/clusters#mainnet-beta
export enum ChainId {
  ETHEREUM_MAINNET = 'eip155:1',
  SOLANA_MAINNET = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
}
