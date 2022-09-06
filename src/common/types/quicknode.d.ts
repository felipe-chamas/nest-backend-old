export interface ExternalApiNft {
  name: string
  collectionName: string
  tokenAddress: string
  collectionAddress: string
  imageUrl: string
  traits: { [key: string]: string }[]
  chain: string
  network: string
  description: string
}

export interface QuickNodeFetchNftsResponse {
  result: {
    assets: ExternalApiNft[]
  }
}

export interface SolscanTokenAccountResponse {
  metadata: {
    data: {
      mint: string
      name: string
      description: string
      image: string
      attributes: {
        trait_type: string
        value: string
      }[]
    }
    collection: { key: string }
  }
}
