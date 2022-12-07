export interface ExternalApiNft {
  name: string
  collectionName: string
  tokenAddress: string
  collectionAddress: string
  imageUrl: string
  traits: { trait_type: string; value: string }[]
  chain: string
  network: string
  description: string
}

export interface QuickNodeFetchNftsResponse {
  result: {
    assets: ExternalApiNft[]
    totalPages: number
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
      uri: string
    }
    collection: { key: string }
  }
}

interface TokenBalance {
  accountIndex: number
  mint: string
  owner: string
  programId: string
  uiTokenAmount: { amount: string; decimals: number; uiAmount: number; uiAmountString: string }
}

export interface QuickNodeGetTransactionResponse {
  result?: {
    meta: {
      preTokenBalances: [TokenBalance]
      postTokenBalances: [TokenBalance, TokenBalance]
    }
  }
}
