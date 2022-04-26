import { AccountId } from 'caip';
import {
  BigNumber, BigNumberish, BytesLike,
  Signature, Signer as EthersSigner,
} from 'ethers';
import { TypedDataSigner } from '@ethersproject/abstract-signer';


/** Default Ethers Signer + support for signing typed messaged */
export type Signer = EthersSigner & TypedDataSigner

export type Address = string;
export type AddressLike = Address | AccountId;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface ERC20AllowancePermitStrict {
  owner: AccountId;
  spender: AccountId;
  amount: BigNumber;
  deadline: BigNumber;
  signature: string;
  splitSignature: Signature;
}

export interface ERC20AllowancePermitBroad {
  owner: AddressLike;
  spender: AddressLike;
  amount: BigNumberish;
  deadline: BigNumberish;
  signature?: BytesLike;
  splitSignature?: Signature;
}

export interface ERC20MetaInfo {
  name: string;
  owner: AccountId;
  symbol: string;
  decimals: number;
  totalSupply: BigNumber;
}

