export type ERC20MockConstructor = { name: string; symbol: string; decimals: number; supply: string };
export type ACLConstructor = { admin: string; operator: string };
export type GameTokenConstructor = { admin: string; name: string; symbol: string; supply: string; acl: string };
export type NFTConstructor = { acl: string; name: string; symbol: string; baseUri: string; maxTokenSupply: string };
export type TokenSaleConstructor = {
  /// Vesting period (in seconds)
  vestingPeriod: number;
  custody: string;
  acl: string;
  gameToken: string;
  paymentToken: string;
};
export type NFTBoxConstructor = { acl: string; name: string; symbol: string; baseUri: string };
export type NFTClaimConstructor = { acl: string; nft: string };
export type NFTBoxUnboxingConstructor = {
  acl: string;
  vrfCoordinator: string;
  nftBox: string;
  requestConfirmations: number;
  subscriptionId: string;
  keyHash: string;
  addToACL?: boolean;
};

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
