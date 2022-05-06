import { BaseService, BaseServiceParams } from './base-service';
import { Utils } from './utils';
import { NFT as NFTTypechain } from '../typechain';
import {
  Address, AddressLike,
  PaginationParams,
} from '../types';
import { BigNumberish, ethers } from 'ethers';
import { ERC721MetaInfo } from '../types';
import { GeneralError } from '../errors';
import { listAsyncItemsWithPagination } from '../utils';
import { AccountId } from 'caip';

export class NFT extends BaseService {

  private readonly nftContract: NFTTypechain;
  private readonly nftAddress: Address;
  private _tokenMetaInfo?: ERC721MetaInfo;


  constructor(
    nftAddressLike: AccountId,
    private readonly utils: Utils,
    baseParams: BaseServiceParams,
  ) {
    super(baseParams);
    this.nftAddress = this.parseAddress(nftAddressLike);
    this.nftContract = this.params.contractResolver
      .getNFT(this.nftAddress);
  }

  async _setup() {
    this._tokenMetaInfo = await this.fetchTokenMetaInfo();
    return this;
  }

  getBalance = (owner: AccountId) =>
    this.nftContract.balanceOf(this.parseAddress(owner));

  getOwnBalance = () =>
    this.nftContract.balanceOf(this.params.signerAddress);


  getOwnerOfToken = async (tokenId: BigNumberish) =>
    this.utils.createAccountIdFromAddress(
      await this.nftContract.ownerOf(tokenId),
    );


  mintToken = async (to: AccountId) =>
    await this.nftContract.mint(this.parseAddress(to));

  burnToken = async (tokenId: BigNumberish) =>
    await this.nftContract.burn(tokenId);


  setBaseTokenURI = async (baseTokenURI: string) =>
    await this.nftContract.setBaseTokenURI(baseTokenURI);

  getBaseTokenURI = () => this.nftContract.getBaseTokenURI();


  setTokenURI = async (tokenId: BigNumberish, tokenURI: string) =>
    await this.nftContract.setTokenURI(tokenId, tokenURI);

  getTokenURI = (tokenId: BigNumberish) => this.nftContract.tokenURI(tokenId);


  /**
   * return `boolean` saying if `operator` could
   * operate(transfer, burn) token `tokenId`
   */
  isApprovedOrOwner = async (operator: AccountId, tokenId: BigNumberish) =>
    this.nftContract.isApprovedOrOwner(this.parseAddress(operator), tokenId);

  approveOperator = async (operator: AccountId, tokenId: BigNumberish) =>
    await this.nftContract.approve(this.parseAddress(operator), tokenId);

  unapproveOperator = async (tokenId: BigNumberish) =>
    await this.nftContract.approve(ethers.constants.AddressZero, tokenId);

  // returns operator that allowed to manage token `tokenId`
  getApprovedOperator = async (tokenId: BigNumberish) =>
    this.utils.createAccountIdFromAddress(
      await this.nftContract.getApproved(tokenId),
    );


  async toggleApprovedOperatorForAllTokens(
    operator: AccountId,
    isAllowedToOperate: boolean,
  ) {
    return await this.nftContract.setApprovalForAll(
      this.parseAddress(operator),
      isAllowedToOperate,
    );
  }

  isOperatorApprovedForAllTokens(
    tokensOwner: AccountId,
    operator: AccountId,
  ) {
    return this.nftContract.isApprovedForAll(
      this.parseAddress(tokensOwner),
      this.parseAddress(operator),
    );
  }


  /**
   * expect that service `signer` is allowed to operate
   * token `tokenId`
   */
  transfer = (to: AccountId, tokenId: BigNumberish) =>
    this.transferFrom(
      this.params.signerAddress,
      this.parseAddress(to),
      tokenId,
    );


  async transferFrom(
    fromAddress: AddressLike,
    toAddress: AddressLike,
    tokenId: BigNumberish,
  ) {
    return await this.nftContract.transferFrom(
      this.parseAddress(fromAddress),
      this.parseAddress(toAddress),
      tokenId,
    );
  }


  /**
   *
   * Token metadata is cached on init then provided
   * with getter `tokenMetaInfo`.
   *
   */

  /***/
  public get tokenMetaInfo(): ERC721MetaInfo {
    if (!this._tokenMetaInfo)
      throw new GeneralError(
        'service_was_not_initialized_properly',
        'No tokenMetaInfo was found. Probably NFT' +
        'Service was not initialized. See `_setup` method',
      );
    return this._tokenMetaInfo;
  }

  /***/
  private async fetchTokenMetaInfo(): Promise<ERC721MetaInfo> {
    const [owner, symbol, name, maxTokenSupply] = await Promise.all([
      this.nftContract.getOwner(),
      this.nftContract.symbol(),
      this.nftContract.name(),
      this.nftContract.getMaxTokenSupply(),
    ]);
    const ownerAccountId = this.utils.createAccountIdFromAddress(owner);
    return {
      symbol,
      name,
      owner: ownerAccountId,
      maxTokenSupply,
    };
  }


  /**
   * Enumerable operations
   */

  /***/
  getTokenTotalSupply = () => this.nftContract.totalSupply();

  getTokenByIndex = (index: BigNumberish) =>
    this.nftContract.tokenByIndex(index);

  listAllTokens = (params?: PaginationParams) => listAsyncItemsWithPagination(
    () => this.getTokenTotalSupply(),
    (index: BigNumberish) => this.getTokenByIndex(index),
    params,
  );

  getTokenOfOwnerByIndex = (owner: AccountId, index: BigNumberish) =>
    this.nftContract.tokenOfOwnerByIndex(this.parseAddress(owner), index);

  getOwnTokenByIndex = (index: BigNumberish) =>
    this.nftContract.tokenOfOwnerByIndex(this.params.signerAddress, index);

  listTokensByOwner = (owner: AccountId, params?: PaginationParams) =>
    listAsyncItemsWithPagination(
      () => this.getBalance(owner),
      (index) => this.getTokenOfOwnerByIndex(owner, index),
      params,
    );

  listOwnTokens = (params?: PaginationParams) => this.listTokensByOwner(
    this.utils.createAccountIdFromAddress(this.params.signerAddress),
    params,
  );

}
