import { AccountId } from 'caip';
import { BigNumberish } from 'ethers';

import type { NFTUnboxing as NFTUnboxingContract } from '../typechain';
import { ErrorCodes, GeneralError } from '../errors';
import { SignerUtils } from '../signer-utils';
import { Signer } from '../types';
import { ContractResolver } from '../contract-resolver';


/**
 * Class provides functionality for unboxing nfts.
 */
export class NFTUnbox {
  private readonly signerUtils: SignerUtils;
  private readonly unboxContract: NFTUnboxingContract;

  private constructor(
    signerUtils: SignerUtils,
    unboxContract: NFTUnboxingContract,
  ) {
    this.signerUtils = signerUtils;
    this.unboxContract = unboxContract;
  }

  static async create(signer: Signer, nftUnboxingAccountId: AccountId) {
    const signerUtils = new SignerUtils(signer);
    const unboxContract = new ContractResolver(signer).resolve(
      'NFTUnboxing',
      await signerUtils.parseAddress(nftUnboxingAccountId),
    );
    return new NFTUnbox(signerUtils, unboxContract);
  }

  /**
   * Requests unboxing.
   */
  requestUnboxing = async (boxId: BigNumberish) =>
    await this.unboxContract.requestUnboxing(boxId);

  /**
   * @param nftAccountIdsToMint is a list of account ids that might be
   * minted during unboxing process.
   *
   * @param tokenCountsToMint is a lint of numbers corresponding of how
   * many of each token from `nftAccountIdsToMint` should be mint
   * during unboxing process.
   *
   */
  async completeUnboxing(
    requestId: BigNumberish,
    nftAccountIdsToMint: AccountId[],
    tokenCountsToMint: BigNumberish[],
  ) {
    if (nftAccountIdsToMint.length !== tokenCountsToMint.length)
      throw new GeneralError(
        ErrorCodes.unboxing_error,
        `nfts length: ${nftAccountIdsToMint.length} !== ` +
        `token counts: ${tokenCountsToMint}.`,
      );
    return this.unboxContract.completeUnboxing(
      requestId,
      await Promise.all(
        nftAccountIdsToMint.map(x => this.signerUtils.parseAddress(x)),
      ),
      tokenCountsToMint,
    );
  }

  /**
   * Returns unbox request id by `boxId`.
   */
  getRequestIdByBoxId = (boxId: BigNumberish) =>
    this.unboxContract.getRequestId(boxId);

  /**
   * Returns box id by unbox `requestId`.
   */
  getBoxIdByRequestId = (requestId: BigNumberish) =>
    this.unboxContract.getTokenId(requestId);

  /**
   * Returns unboxed random by `boxId`.
   */
  getGeneratedRandomByBoxId = (boxId: BigNumberish) =>
    this.unboxContract.getRandomResultByTokenId(boxId);

  /**
   * Returns unbox random by unbox `requestId`.
   */
  getGeneratedRandomByRequestId = (requestId: BigNumberish) =>
    this.unboxContract.getRandomResultByRequestId(requestId);

}
