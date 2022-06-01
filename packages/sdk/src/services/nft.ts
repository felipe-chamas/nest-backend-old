import { AccountId } from 'caip';
import { BigNumberish, ethers } from 'ethers';

import { NFT as NFTContract } from '../typechain';
import { PaginationParams, Signer } from '../types';
import { ERC721MetaInfo } from '../types';
import { listAsyncItemsWithPagination } from '../utils';
import { SignerUtils } from '../signer-utils';
import { ContractResolver } from '../contract-resolver';

/**
 * Provides functionality to manage NFT ERC721 token.
 *
 * @remarks
 * NFTs are used as in game items or sealed boxes.
 *
 * @remarks
 * It contains basic operations to ming tokens, get balance,
 * transfer, get contract metadata, manage allowance.
 */
export class NFT {
  private readonly signerUtils: SignerUtils;
  private readonly nftContract: NFTContract;
  readonly tokenMetaInfo: ERC721MetaInfo;

  constructor(
    signerUtils: SignerUtils,
    nftContract: NFTContract,
    tokenMetaInfo: ERC721MetaInfo,
  ) {
    this.signerUtils = signerUtils;
    this.nftContract = nftContract;
    this.tokenMetaInfo = tokenMetaInfo;
  }

  static async create(signer: Signer, nftContractAccountId: AccountId) {
    const signerUtils = new SignerUtils(signer);
    const nftContract = new ContractResolver(signer).resolve(
      'NFT',
      await signerUtils.parseAddress(nftContractAccountId),
    );
    const [symbol, name, maxTokenSupply] = await Promise.all([
      nftContract.symbol(),
      nftContract.name(),
      nftContract.getMaxTokenSupply(),
    ]);
    const metaInfo: ERC721MetaInfo = {
      name,
      symbol,
      maxTokenSupply,
    };
    return new NFT(signerUtils, nftContract, metaInfo);
  }

  /**
   * @returns Amount of tokens owned by the `owner`.
   */
  getBalance = async (owner: AccountId) =>
    this.nftContract.balanceOf(await this.signerUtils.parseAddress(owner));

  /**
   * @returns amount of own tokens.
   */
  getOwnBalance = async () =>
    this.nftContract.balanceOf(await this.signerUtils.signer.getAddress());

  /**
   * @returns the owner of token `tokenId`.
   */
  getOwnerOfToken = async (tokenId: BigNumberish) =>
    this.signerUtils.createAccountIdFromAddress(
      await this.nftContract.ownerOf(tokenId),
    );

  /**
   * Mint token to `to`.
   */
  mintToken = async (to: AccountId) =>
    await this.nftContract.mint(await this.signerUtils.parseAddress(to));

  /**
   * Burns own token `tokenId`.
   *
   * @remarks
   * Only a {@link Roles | Minter} can burn tokens.
   */
  burnToken = async (tokenId: BigNumberish) =>
    await this.nftContract.burn(tokenId);

  /**
   * Sets token's base uri.
   */
  setBaseTokenURI = async (baseTokenURI: string) =>
    await this.nftContract.setBaseTokenURI(baseTokenURI);

  /**
   * Returns token's base uri.
   */
  getBaseTokenURI = () => this.nftContract.getBaseTokenURI();

  /**
   * Sets `tokenId`s uri.
   */
  setTokenURI = async (tokenId: BigNumberish, tokenURI: string) =>
    await this.nftContract.setTokenURI(tokenId, tokenURI);

  /**
   * Returns `tokenId`s uri.
   */
  getTokenURI = (tokenId: BigNumberish) => this.nftContract.tokenURI(tokenId);

  /**
   * Checks if `operator` is approved to operate `tokenId`.
   */
  isApprovedOrOwner = async (operator: AccountId, tokenId: BigNumberish) =>
    this.nftContract.isApprovedOrOwner(
      await this.signerUtils.parseAddress(operator),
      tokenId,
    );

  /**
   * Allows `operator` to operate `tokenId`.
   */
  approveOperator = async (operator: AccountId, tokenId: BigNumberish) =>
    await this.nftContract.approve(
      await this.signerUtils.parseAddress(operator),
      tokenId,
    );

  /**
   * Disallows anyone to operate `tokenId`.
   */
  unapproveOperator = async (tokenId: BigNumberish) =>
    await this.nftContract.approve(ethers.constants.AddressZero, tokenId);

  /**
   * Returns operator that allowed to manage `tokenId`.
   */
  getApprovedOperator = async (tokenId: BigNumberish) =>
    this.signerUtils.createAccountIdFromAddress(
      await this.nftContract.getApproved(tokenId),
    );

  /**
   * Allows/disallows `operator` to operate on all of own tokens.
   */
  toggleApprovedOperatorForAllTokens = async (
    operator: AccountId,
    isAllowedToOperate: boolean,
  ) =>
    await this.nftContract.setApprovalForAll(
      await this.signerUtils.parseAddress(operator),
      isAllowedToOperate,
    );

  /**
   * Checks if `operator` is allowed to operate `tokenOwner`s tokens.
   */
  isOperatorApprovedForAllTokens = async (
    tokensOwner: AccountId,
    operator: AccountId,
  ) =>
    this.nftContract.isApprovedForAll(
      await this.signerUtils.parseAddress(tokensOwner),
      await this.signerUtils.parseAddress(operator),
    );

  /**
   * Transfer own token `tokenId` to `to`.
   *
   * @remarks
   * Expect that service `signer` is allowed to operate
   * token `tokenId`.
   */
  transfer = async (to: AccountId, tokenId: BigNumberish) =>
    this.transferFrom(
      await this.signerUtils.createAccountIdFromAddress(
        await this.signerUtils.signer.getAddress(),
      ),
      to,
      tokenId,
    );

  /**
   * Transfers token `tokenId` from `from` to `to`.
   */
  transferFrom = async (
    from: AccountId,
    to: AccountId,
    tokenId: BigNumberish,
  ) =>
    await this.nftContract.transferFrom(
      await this.signerUtils.parseAddress(from),
      await this.signerUtils.parseAddress(to),
      tokenId,
    );

  /**
   * Enumerable operations.
   */

  /**
   * Returns the amount on token in existance.
   */
  getTokenTotalSupply = () => this.nftContract.totalSupply();

  /**
   * @returns Token by index.
   *
   * @remarks
   * It includes all existing token. Not limited to any owner.
   */
  getTokenByIndex = (index: BigNumberish) =>
    this.nftContract.tokenByIndex(index);

  /**
   * @returns Paginated list of tokens.
   *
   * @remarks
   * It includes all existing token. Not limited to any owner.
   */
  listAllTokens = (params?: PaginationParams) =>
    listAsyncItemsWithPagination(
      () => this.getTokenTotalSupply(),
      (index: BigNumberish) => this.getTokenByIndex(index),
      params,
    );

  /**
   * @returns `owner`'s token by `index`.
   */
  getTokenOfOwnerByIndex = async (owner: AccountId, index: BigNumberish) =>
    this.nftContract.tokenOfOwnerByIndex(
      await this.signerUtils.parseAddress(owner),
      index,
    );

  /**
   * @returns Own token by index.
   */
  getOwnTokenByIndex = async (index: BigNumberish) =>
    this.nftContract.tokenOfOwnerByIndex(
      await this.signerUtils.signer.getAddress(),
      index,
    );

  /**
   * @returns Paginated list of `owner`'s token.
   */
  listTokensByOwner = (owner: AccountId, params?: PaginationParams) =>
    listAsyncItemsWithPagination(
      () => this.getBalance(owner),
      (index) => this.getTokenOfOwnerByIndex(owner, index),
      params,
    );

  /**
   * @returns paginated list of own tokens.
   */
  listOwnTokens = async (params?: PaginationParams) =>
    this.listTokensByOwner(
      await this.signerUtils.createAccountIdFromAddress(
        await this.signerUtils.signer.getAddress(),
      ),
      params,
    );
}
