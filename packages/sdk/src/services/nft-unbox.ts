import { BaseService, BaseServiceParams } from './base-service';
import { Address } from '../types';
import { AccountId } from 'caip';
import type { NFTUnboxing } from '../typechain';
import { ErrorCodes, GeneralError } from '../errors';
import { BigNumberish } from 'ethers';

export class NFTUnbox extends BaseService {

  private readonly contract: NFTUnboxing;
  private readonly contractAddress: Address;

  constructor(
    nftUnboxContractAccountId: AccountId,
    baseParams: BaseServiceParams,
  ) {
    super(baseParams);
    this.contractAddress = this.parseAddress(nftUnboxContractAccountId);
    this.contract = this.params.contractResolver
      .getNFTUnbox(this.contractAddress);
  }

  requestUnboxing = async (boxId: BigNumberish) =>
    await this.contract.requestUnboxing(boxId);

  /**
   * @param nftAccountIdsToMint is a list of account ids that might be
   * mind during unboxing process.
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
        ErrorCodes.input_validation_error,
        `nfts length: ${nftAccountIdsToMint.length} !== ` +
        `token counts: ${tokenCountsToMint}.`,
      );
    return this.contract.completeUnboxing(
      requestId,
      nftAccountIdsToMint.map(x => this.parseAddress(x)),
      tokenCountsToMint,
    );
  }

  getRequestIdByBoxId = (boxId: BigNumberish) =>
    this.contract.getRequestId(boxId);

  getBoxIdByRequestId = (requestId: BigNumberish) =>
    this.contract.getTokenId(requestId);

  getGeneratedRandomByBoxId = (boxId: BigNumberish) =>
    this.contract.getRandomResultByTokenId(boxId);

  getGeneratedRandomByRequestId = (requestId: BigNumberish) =>
    this.contract.getRandomResultByRequestId(requestId);

}
