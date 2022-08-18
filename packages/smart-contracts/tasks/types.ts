import { BigNumberish } from 'ethers';

export type BaseConstructor = { silent?: boolean };
export type ERC20MockConstructor = { name: string; symbol: string; decimals: number; supply: string };
export type ACLConstructor = BaseConstructor & { admin: string; operator: string };
export type SplitterConstructor = BaseConstructor;
export type StakingConstructor = BaseConstructor & {
  nftStake: string;
  tokenContract: string;
  custody: string;
  acl: string;
};
export type GameTokenConstructor = BaseConstructor & {
  admin: string;
  name: string;
  symbol: string;
  supply: string;
  acl: string;
};
export type NFTConstructor = BaseConstructor & {
  acl: string;
  name: string;
  symbol: string;
  baseUri: string;
  maxTokenSupply: string;
  burnEnabled: boolean;
};
export type NFTLaunchpadConstructor = NFTConstructor & {
  launchpad: string;
};
export type TokenSaleConstructor = BaseConstructor & {
  /// Vesting period (in seconds)
  vestingPeriod: number;
  custody: string;
  acl: string;
  gameToken: string;
  paymentToken: string;
};
export type NFTBoxConstructor = BaseConstructor & { acl: string; name: string; symbol: string; baseUri: string };
export type NFTClaimConstructor = BaseConstructor & { acl: string; nft: string };
export type NFTBoxUnboxingConstructor = BaseConstructor & {
  acl: string;
  nftBox: string;
  addToACL?: boolean;
};
export type MarketplaceConstructor = BaseConstructor & {
  acl: string;
  name: string;
  erc20FeePercent: BigNumberish;
  nftFee: BigNumberish;
  custody: string;
  gameToken: string;
};
export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type NFTLevelUpConstructor = BaseConstructor & {
  acl: string;
  levelUpValue: string;
  receiver: string;
  addToACL?: boolean;
};
