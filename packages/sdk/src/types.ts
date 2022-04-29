import { AccountId } from 'caip';
import {
  BigNumber, BigNumberish, BytesLike,
  Signature, Signer as EthersSigner,
} from 'ethers';
import { TypedDataSigner } from '@ethersproject/abstract-signer';

/**
 * The file of this export is generated automatically by
 * src/generate-helper-types.ts
 * It contains such types as:
 * - ContractName: 'ACL' | 'GameToken' | ...
 * - EventName: 'RoleRevoked' | 'RoleGranted' | ...
 * - EventSignature 'RoleRevoked(address,address,bytes32)' | ...
 */
export {
  ContractName,
  EventName,
  EventSignature,
} from './typechain/helpers';


/** Default Ethers Signer + support for signing typed messaged */
export type Signer = EthersSigner & TypedDataSigner

export type Address = string;
export type AddressLike = Address | AccountId;

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

