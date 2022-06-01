import { AccountId } from 'caip';
import { BigNumber, BigNumberish, Signer as EthersSigner } from 'ethers';
import { TypedDataSigner } from '@ethersproject/abstract-signer';

/**
 * The file of this export is generated
 * automatically by generate-helper-types.ts
 */
export { ContractName, EventName, EventSignature } from './typechain/helpers';

/**
 * Default Ethers Signer + support for signing typed messaged
 */
export type Signer = EthersSigner & TypedDataSigner;

/**
 * Mapping to plain string to describe address.
 */
export type Address = string;

/**
 * Data structure that is used to describe signed approval.
 */
export interface ERC20SignedApproval {
  owner: AccountId;
  spender: AccountId;
  amount: BigNumber;
  deadline: BigNumber;
  signature: string;
}

export interface TokenBaseMetaInfo {
  name: string;
  symbol: string;
}

export interface ERC20MetaInfo extends TokenBaseMetaInfo {
  decimals: number;
  totalSupply: BigNumber;
}

export interface ERC721MetaInfo extends TokenBaseMetaInfo {
  maxTokenSupply: BigNumber;
}

/**
 * Describe how many items should be used and with what offset.
 *
 * @see {@link AccessControl.lisByRole}
 */
export interface PaginationParams {
  offset: BigNumberish;
  limit: BigNumberish;
}

/**
 * Describes an object that contains an information to
 * proof {@link NFTClaimData}.
 *
 * @see Usage
 * - {@link NFTClaim.createClaimProof}
 * - {@link NFTClaim.submitClaimProof}
 */
export interface NFTClaimProof {
  merkleRoot: string;
  provingSequence: string[];
  claim: NFTClaimData;
}

/**
 * Describes how many tokens is assigned after an account id.
 */
export interface NFTClaimData {
  accountId: AccountId;
  tokenCount: BigNumber;
}

/**
 * @description
 * Account id and amount
 */
export interface Payee {
  accountId: AccountId;
  amount: BigNumberish;
}
