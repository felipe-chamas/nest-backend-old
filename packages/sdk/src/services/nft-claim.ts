import { NFTClaim as NFTClaimContract } from '../typechain';
import { BytesLike, ContractTransaction } from 'ethers';
import { AccountId } from 'caip';
import MerkleTree from 'merkletreejs';

import {
  createNFTClaimMerkleTree,
  createNFTClaimMerkleTreeLeaf,
} from '../../scripts/utils';
import { NFTClaimProof, NFTClaimData, Signer } from '../types';
import { ErrorCodes, GeneralError } from '../errors';
import { SignerUtils } from '../signer-utils';
import { ContractResolver } from '../contract-resolver';

export type CreateClaimProofParams = {
  claimData: NFTClaimData;
  merkleTree: MerkleTree;
};

/**
 * Class provides functionality related to claiming nfts.
 *
 * @remarks
 * `NFTClaim` might be used to make gifts for users.
 * {@link NFTClaim} does both things:
 * {@link NFTClaim.createAndSubmitMerkleTreeFromClaims | creating a gift}
 * by the manager or operator and
 * {@link NFTClaim.createAndSubmitClaimProof | claiming a gift} by the end user.
 */
export class NFTClaim {
  private readonly signerUtils: SignerUtils;
  private readonly nftClaimContract: NFTClaimContract;

  constructor(signerUtils: SignerUtils, nftClaimContract: NFTClaimContract) {
    this.signerUtils = signerUtils;
    this.nftClaimContract = nftClaimContract;
  }

  static async create(signer: Signer, nftClaimContractAccountId: AccountId) {
    const signerUtils = new SignerUtils(signer);
    const nftClaimContract = new ContractResolver(signer).resolve(
      'NFTClaim',
      await signerUtils.parseAddress(nftClaimContractAccountId),
    );
    return new NFTClaim(signerUtils, nftClaimContract);
  }

  /**
   * Returns chain id as a number.
   *
   * @throws {@link GeneralError | nft_claim_error}
   * If chain id in not parsable number.
   */
  private async getChainIdAsANumber() {
    const chainId = await this.signerUtils.getSignerChainId();
    const result = parseInt(chainId);
    if (result.toString() !== chainId)
      throw new GeneralError(
        ErrorCodes.nft_claim_error,
        `chain Id ${chainId} can not be transformed to number`,
      );
    return result;
  }

  /**
   * @remarks
   * This method is a first step(generation) in two step
   * process to create new nft claims(in a form of gifts, free nfts)
   * and include them in the system.
   * In the second step the result of the first step is submitted to
   * the blockchain. Or use `this.createAndSubmitClaimProof` to make
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
   * @remarks
   * Listen for 'MerkleRootAdded' event on 'NFTClaim' contract
   *
   */
  async createMerkleTreeFromClaims(claims: NFTClaimData[]) {
    const addresses = await Promise.all(
      claims.map((x) => this.signerUtils.parseAddress(x.accountId)),
    );
    const claimList = claims.map((x, idx) => ({
      tokens: x.tokenCount.toNumber(),
      account: addresses[idx],
    }));
    return createNFTClaimMerkleTree(
      await this.getChainIdAsANumber(),
      this.nftClaimContract.address,
      claimList,
    );
  }

  /**
   * Submits merkle root created with {@link createMerkleTreeFromClaims}.
   */
  submitNewMerkleRoot = async (root: BytesLike) =>
    await this.nftClaimContract.addMerkleRoot(root);

  /**
   * Creates and submits merkle tree claims in single call.
   *
   * @remarks
   * Simple wrapper around `createMerkleTreeFromClaims` and
   * `submitNewMerkleRoot` that merges both function in a single call
   *
   * @returns array of: 1st is merkleTree from `createMerkleTreeFromClaims`
   * call and 2nd is transaction of submitting new merkle tree from call
   * to `submitNewMerkleRoot`
   */
  async createAndSubmitMerkleTreeFromClaims(
    claims: NFTClaimData[],
  ): Promise<
    [merkleTree: MerkleTree, submitRootTransaction: ContractTransaction]
  > {
    const tree = await this.createMerkleTreeFromClaims(claims);
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
   * @remarks
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
   * @remarks
   * Listen for 'TokenClaimed' event on 'NFTClaim' contract.
   *
   */
  async createClaimProof(params: CreateClaimProofParams) {
    const provingLeaf = createNFTClaimMerkleTreeLeaf(
      await this.getChainIdAsANumber(),
      this.nftClaimContract.address,
      await this.signerUtils.parseAddress(params.claimData.accountId),
      params.claimData.tokenCount.toNumber(),
    );
    const provingSequence = params.merkleTree.getHexProof(provingLeaf);
    const result: NFTClaimProof = {
      merkleRoot: params.merkleTree.getHexRoot(),
      claim: params.claimData,
      provingSequence,
    };
    return result;
  }

  /**
   * Check if proof will be acceped by the blockchain.
   *
   * @remarks
   * Use it before submitting the proof to not loose extra fee for
   * gas in case proof is not valid.
   */
  isClaimProofAllowed = async (proof: NFTClaimProof) =>
    this.nftClaimContract.isClaimAllowed(
      proof.merkleRoot,
      proof.provingSequence,
      await this.signerUtils.parseAddress(proof.claim.accountId),
      proof.claim.tokenCount,
    );

  /**
   * Submits claim to the blockchain.
   */
  submitClaimProof = async (proof: NFTClaimProof) =>
    await this.nftClaimContract.claim(
      proof.merkleRoot,
      proof.provingSequence,
      await this.signerUtils.parseAddress(proof.claim.accountId),
      proof.claim.tokenCount,
    );

  /**
   * Creates and submits claim proof in a single call.
   */
  async createAndSubmitClaimProof(params: CreateClaimProofParams) {
    const proof = await this.createClaimProof(params);
    const isProofValid = await this.isClaimProofAllowed(proof);
    if (!isProofValid)
      throw new GeneralError(
        ErrorCodes.nft_claim_error,
        'Claim was created but is not accepted by contract as valid.',
      );
    return await this.submitClaimProof(proof);
  }
}
