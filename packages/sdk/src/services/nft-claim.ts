import { BaseService, BaseServiceParams } from './base-service';
import { NFTClaim as NFTClaimTypechain } from '../typechain';
import { Address } from '../types';
import { AccountId } from 'caip';
import {
  createNFTClaimMerkleTree,
  createNFTClaimMerkleTreeLeaf,
} from '../../scripts/utils';
import { BytesLike, ContractTransaction, ethers } from 'ethers';
import {
  NFTClaimProof,
  NFTClaimData,
} from '../types';
import { ErrorCodes, GeneralError } from '../errors';
import MerkleTree from 'merkletreejs';


export type CreateClaimProofParams = {
  claimData: NFTClaimData,
} & ({
  merkleTree: MerkleTree,
} | {
  merkleTreeLeaves: string[],
})


export class NFTClaim extends BaseService {

  private readonly nftClaimContract: NFTClaimTypechain;
  private readonly nftClaimAddress: Address;
  private readonly chainIdAsANumber: number;

  constructor(
    nftClaimAddressLike: AccountId,
    baseParams: BaseServiceParams,
  ) {
    super(baseParams);
    this.nftClaimAddress = this.parseAddress(nftClaimAddressLike);
    this.nftClaimContract = this.params.contractResolver
      .getNFTClaim(this.nftClaimAddress);
    const chainId = this.params.signerChainId;
    this.chainIdAsANumber = parseInt(chainId);
    if (this.chainIdAsANumber.toString() !== chainId)
      throw new GeneralError(
        ErrorCodes.nft_claim_error,
        `chain Id ${chainId} can not be transformed to number`,
      );
  }


  /**
   *
   * Initialize Claims section
   *
   */

  /**
   *
   * This method is a first step(generation) in two step
   * process to create new nft claims(in a form of gifts, free nfts)
   * and include them in the system.
   *
   * In the second step the result of the first step is submitted to
   * the blockchain. Or use `this.createAndSubmitClaimProof` to markel
   * second step automatic.
   *
   *
   * @returns MerkleTree. NFTClaim security is based on merkle tree.
   * Use merkleTree.getHexRoot() to acuire value
   * that should then be submitted to the blockchain with the help of
   * method `this.submitNewMerkleRoot` for system to accept new claims.
   * In addition its required to publish merkleTree.getLeaves() for others
   * to be able to generate claim proofs.
   *
   * Listen for 'MerkleRootAdded' event on 'NFTClaim' contract
   *
   */
  createMerkleTreeFromClaims(claims: NFTClaimData[]) {
    return createNFTClaimMerkleTree(
      this.chainIdAsANumber,
      this.nftClaimAddress,
      claims.map(x => ({
        tokens: x.tokenCount.toNumber(),
        account: this.parseAddress(x.accountId),
      })),
    );
  }

  async submitNewMerkleRoot(root: BytesLike) {
    return await this.nftClaimContract.addMerkleRoot(root);
  }

  /**
   * Simple wrapper around `createMerkleTreeFromClaims` and
   * `submitNewMerkleRoot` that merges both function in a single call
   * @returns array of: 1st is merkleTree from `createMerkleTreeFromClaims`
   * call and 2nd is transaction of submitting new merkle tree from call
   * to `submitNewMerkleRoot`
   */
  async createAndSubmitMerkleTreeFromClaims(
    claims: NFTClaimData[],
  ): Promise<[
    merkleTree: MerkleTree,
    submitRootTransaction: ContractTransaction,
  ]> {
    const tree = this.createMerkleTreeFromClaims(claims);
    const transaction = await this.submitNewMerkleRoot(tree.getHexRoot());
    return [tree, transaction];
  }


  /**
   *
   * Create claim proofs. Claim NFTs section
   *
   */

  /**
   *
   * Creates claim proof.
   *
   * Claims have already been created and submitted to the blockchain
   * with the help of `this.createAndSubmitMerkleTreeFromClaims`.
   * And `merkleTree` or just its `leaves`(array of string) have been published.
   *
   * Then users that were included in the claim-list would like to
   * proof that they are actually in the list and claim their nfts.
   *
   * To do that, first the user should create a `proof` that
   * provess/he is on the list with the  `this.createClaimProof` method.
   *
   * @param params.claimData pass in claim data consisting of your address
   * and amount of tokens your should receive according to
   * nft give-away/gifts program. Usually user should receive this
   * information via a private channal(ex email).
   *
   * @param params.merkleTree pass in merkle tree that is associated with
   * give-away/gifiting program or pass just `merkleTreeLeavea`.
   *
   * Listen for 'TokenClaimed' event on 'NFTClaim' contract.
   *
   */
  createClaimProof(params: CreateClaimProofParams): NFTClaimProof {
    const provingLeaf = createNFTClaimMerkleTreeLeaf(
      this.chainIdAsANumber,
      this.nftClaimAddress,
      this.parseAddress(params.claimData.accountId),
      params.claimData.tokenCount.toNumber(),
    );
    let merkleTree: MerkleTree;
    if ('merkleTree' in params)
      merkleTree = params.merkleTree;
    else if ('merkleTreeLeaves' in params)
      merkleTree = new MerkleTree(
        params.merkleTreeLeaves,
        ethers.utils.keccak256,
        { sort: true },
      );
    if (!merkleTree) throw new GeneralError(
      ErrorCodes.nft_claim_error,
      'merkle tree or its leaves were not provided',
    );
    const provingSequence = merkleTree.getHexProof(provingLeaf);
    return {
      merkleRoot: merkleTree.getHexRoot(),
      claim: params.claimData, provingSequence,
    };
  }

  /**
   * Validates if proof is valid acording to the blockchain.
   * Use it before submitting the proof to not loose extra fee for
   * gas in case proof is not valid
   */
  isClaimProofAllowed(proof: NFTClaimProof) {
    return this.nftClaimContract.isClaimAllowed(
      proof.merkleRoot,
      proof.provingSequence,
      this.parseAddress(proof.claim.accountId),
      proof.claim.tokenCount,
    );
  }

  /**
   * Submits claim to the blockchain. Listen for event
   */
  async submitClaimProof(proof: NFTClaimProof) {
    return await this.nftClaimContract.claim(
      proof.merkleRoot,
      proof.provingSequence,
      this.parseAddress(proof.claim.accountId),
      proof.claim.tokenCount,
    );
  }

  /**
   * This method wraps the whole process of claim proof creation,
   * validation, submission in a single call
   */
  async createAndSubmitClaimProof(params: CreateClaimProofParams) {
    const proof = this.createClaimProof(params);
    const isProofValid = await this.isClaimProofAllowed(proof);
    if (!isProofValid) throw new GeneralError(
      ErrorCodes.nft_claim_error,
      'Claim was created but is not accepted by contract as valid',
    );
    return await this.submitClaimProof(proof);
  }

}
