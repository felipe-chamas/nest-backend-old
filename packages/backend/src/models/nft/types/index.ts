export interface QuickNodeFetchNftsAsset {
  name: string;
  collectionName: string;
  tokenAddress: string;
  collectionAddress: string;
  imageUrl: string;
  traits: [{ [key: string]: string }];
  chain: string;
  network: string;
  description: string;
}

export interface QuickNodeFetchNftsResponse {
  result: {
    assets: QuickNodeFetchNftsAsset[];
  };
}
