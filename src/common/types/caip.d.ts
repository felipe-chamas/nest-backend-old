export interface ChainIdDto {
  namespace: string
  reference: string
}

export interface AssetNameDto {
  namespace: string
  reference: string
}

export interface AccountIdDto {
  chainId: ChainIdDto
  address: string
}

export interface AssetTypeDto {
  chainId: ChainIdDto
  assetName: AssetNameDto
}

export interface AssetIdDto {
  chainId: ChainIdDto
  assetName: AssetNameDto
  tokenId: string
}

interface IMoralisNetworks {
  [key: string]: {
    id: string
    chain: string
    name: string
  }
}
