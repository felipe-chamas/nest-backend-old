import { BaseService, BaseServiceParams } from './base-service';
import { Utils } from './utils';
import { GameToken as GameTokenImpl } from '../typechain';
import {
  Address, AddressLike, ERC20AllowancePermitBroad,
  ERC20AllowancePermitStrict,
} from '../types';
import { BigNumber, BigNumberish, ethers, Signature } from 'ethers';
import { ERC20MetaInfo } from '../types';
import { GeneralError } from '../errors';

export class GameToken extends BaseService {

  private readonly gameTokenContract: GameTokenImpl;
  private readonly gameTokenAddress: Address;
  private _tokenMetaInfo?: ERC20MetaInfo;


  constructor(
    gameTokenAddressLike: AddressLike,
    private readonly utils: Utils,
    baseParams: BaseServiceParams,
  ) {
    super(baseParams);
    this.gameTokenAddress = this.parseAddress(gameTokenAddressLike);
    this.gameTokenContract = this.params.contractResolver
      .getGameToken(this.gameTokenAddress);
  }

  async _setup() {
    this._tokenMetaInfo = await this.fetchTokenMetaInfo();
    return this;
  }


  getBalanceOf(address: AddressLike) {
    return this.gameTokenContract.balanceOf(this.parseAddress(address));
  }


  /**
   *
   * Management of own tokens
   *
   */

  /** transfer own tokens `amount` to `toAddress` */
  async transfer(toAddress: AddressLike, amount: BigNumberish) {
    return await this.gameTokenContract.transfer(
      this.parseAddress(toAddress),
      amount,
    );
  }

  /** Burn tokens owned by `sender` */
  async burnToken(amount: BigNumberish) {
    return await this.gameTokenContract.burn(amount);
  }


  async approve(spender: AddressLike, amount: BigNumberish) {
    return await this.gameTokenContract.approve(
      this.parseAddress(spender),
      amount,
    );
  }

  async increaseAllowance(spender: AddressLike, amount: BigNumberish) {
    return await this.gameTokenContract.increaseAllowance(
      this.parseAddress(spender),
      amount,
    );
  }

  async decreaseAllowance(spender: AddressLike, amount: BigNumberish) {
    return await this.gameTokenContract.decreaseAllowance(
      this.parseAddress(spender),
      amount,
    );
  }

  /** Get how much tokens of `owner` can be used by a `spender` */
  getAllowance(owner: AddressLike, spender: AddressLike) {
    return this.gameTokenContract.allowance(
      this.parseAddress(owner),
      this.parseAddress(spender),
    );
  }

  /**
   *
   * Management of others tokens by allowance mechanism,
   * meaning person who calls these methods should be allowed
   * to spend `owners` tokens.
   * Owner should use methods: `approve`, `permit`, etc to set allowance
   * for spender
   *
   */

  getNonceOf(owner: AddressLike) {
    return this.gameTokenContract.nonces(this.parseAddress(owner));
  }

  getOwnNonce() {
    return this.getNonceOf(this.params.signerAddress);
  }

  private readonly PERMIT_MESSAGE_TYPES_DEFINITION = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };

  /**
   * Create an object of type `ERC20AllowancePermit` that
   * should be submitted to contract with a help of
   * `submitAllowancePermit` method. You can create permit to use
   * your owntokens. There is no way to create permit to use other's tokens
   * that you are allowed to use.
   * @param deadline is seconds from epoch until this allowancePermit is valid
   * ex: deadline = Math.round(Date.now()/1000)+60*60 - meaning anyone
   * will be able to submit this permit for 1 hour(60*60 seconds)
   */
  async createAllowancePermit(
    spender: AddressLike,
    amount: BigNumberish,
    deadline: BigNumberish,
  ) {
    const ownerAddress = this.params.signerAddress;
    const spenderAddress = this.parseAddress(spender);
    const value = BigNumber.from(amount);
    const signature = await this.params.signer._signTypedData({
      name: this.tokenMetaInfo.name,
      version: '1',
      chainId: this.params.signerChainId,
      verifyingContract: this.gameTokenAddress,
    },
    this.PERMIT_MESSAGE_TYPES_DEFINITION,
    {
      owner: ownerAddress,
      spender: spenderAddress,
      value,
      nonce: await this.getOwnNonce(),
      deadline,
    });
    const result: ERC20AllowancePermitStrict = {
      owner: this.utils.createAccountIdFromAddress(ownerAddress),
      spender: this.utils.createAccountIdFromAddress(spenderAddress),
      amount: BigNumber.from(amount),
      deadline: BigNumber.from(deadline),
      signature,
      splitSignature: ethers.utils.splitSignature(signature),
    };
    return result;
  }

  async submitAllowancePermit(
    permit: ERC20AllowancePermitBroad | ERC20AllowancePermitStrict,
  ) {
    const ownerAddress = this.parseAddress(permit.owner);
    const spenderAddress = this.parseAddress(permit.spender);
    const amount = BigNumber.from(permit.amount);
    const deadline = BigNumber.from(permit.deadline);
    // check is signature valid
    let signature: Signature | null = null;
    if (permit.signature) {
      signature = ethers.utils.splitSignature(permit.signature);
    } else if (permit.splitSignature) {
      signature = permit.splitSignature;
    }
    if (!signature)
      throw new GeneralError(
        'provided_signature_is_not_valid',
        'permit contains invalid signature',
      );
    return await this.gameTokenContract.permit(
      ownerAddress,
      spenderAddress,
      amount,
      deadline,
      signature.v,
      signature.r,
      signature.s,
    );
  }


  /**
   * transfer owners token `amount` to `toAddress`. Sender should be
   * allowed to spend these tokens
   */
  async transferFrom(
    fromAddress: AddressLike,
    toAddress: AddressLike,
    amount: BigNumberish,
  ) {
    return await this.gameTokenContract.transferFrom(
      this.parseAddress(fromAddress),
      this.parseAddress(toAddress),
      amount,
    );
  }

  /**
   * `sender` should be allowed to burn `owner's` token using
   * methods: `increaseAllowance`, `approve`, `permit`
   */
  async burnTokenFrom(owner: AddressLike, amount: BigNumberish) {
    return await this.gameTokenContract.burnFrom(
      this.parseAddress(owner),
      amount,
    );
  }


  /**
   *
   * Token pausable state managment. If contract is paused,
   * some operations are not allowed.
   *
   */

  /** Move GameToken contract to paused state. */
  pauseToken = () => this.gameTokenContract.pause();

  /** Check if GameToken contract is in paused state. */
  isTokenPaused = () => this.gameTokenContract.paused();

  /** Move GameToken contract to unpaused state. */
  unpauseToken = () => this.gameTokenContract.unpause();


  /**
   * If someone sent `transfer`/`transferFrom` etc. to address
   * of gameToken contract itself, Only `Admin` can recover it by
   * providing related information. There should be enough tokens
   * on contract's balance. `Admin` might use any `amount`. The only
   * limitation is getBalanceOf(contract) should contain such `amount`.
   */
  async recover(
    addressOfTokenToRecover: AddressLike,
    whoSentAddress: AddressLike,
    amount: BigNumberish,
  ) {
    return await this.gameTokenContract.recover(
      this.parseAddress(addressOfTokenToRecover),
      this.parseAddress(whoSentAddress),
      amount,
    );
  }


  /**
   *
   * Token metadata is cached on init then provided
   * with getter `tokenMetaInfo`.
   *
   */

  /***/
  public get tokenMetaInfo(): ERC20MetaInfo {
    if (!this._tokenMetaInfo)
      throw new GeneralError(
        'service_was_not_initialized_properly',
        'No tokenMetaInfo was found. Probably GameToken' +
        'Service was not initialized. See `_init` method',
      );
    return this._tokenMetaInfo;
  }

  /***/
  private async fetchTokenMetaInfo(): Promise<ERC20MetaInfo> {
    const owner = await this.gameTokenContract.owner();
    const ownerAccountId = this.utils.createAccountIdFromAddress(owner);
    return {
      symbol: await this.gameTokenContract.symbol(),
      name: await this.gameTokenContract.name(),
      owner: ownerAccountId,
      decimals: await this.gameTokenContract.decimals(),
      totalSupply: await this.gameTokenContract.totalSupply(),
    };
  }

}
