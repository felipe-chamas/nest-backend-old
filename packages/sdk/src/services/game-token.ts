import { BigNumber, BigNumberish, ethers, Signature } from 'ethers';
import { AccountId } from 'caip';

import { GameToken as GameTokenContract } from '../typechain';
import { ERC20SignedApproval, Payee, Signer } from '../types';
import { ERC20MetaInfo } from '../types';
import { SignerUtils } from '../signer-utils';
import { ContractResolver } from '../contract-resolver';
import { GeneralError, ErrorCodes } from '../errors';

/**
 * Object is used to create approval
 */
const APPROVAL_MESSAGE_TYPES_DEFINITION = {
  Permit: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

/**
 * Class provides functionality related to management of GameToken ERC20.
 *
 * @remarks
 * It contains basic operations to get balance, transfer, get contract metadata,
 * manage allowance.
 *
 * @remarks
 * Token metadata is cached then provided
 * with getter {@link GameToken.tokenMetaInfo}.
 *
 * @remarks
 * Class contains pausable state managment. If contract is paused,
 * some operations are not allowed.
 *
 *
 * @remarks
 * Provides functionality to use {@link https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Permit | off-chain approval}.
 * Use {@link GameToken.createSignedApproval | to create off-chain approval}
 * and then {@link GameToken.submitSignedApproval | to submit off-chain aproval}.
 *
 * @remarks
 * Usecase of off-chain approvals is as following: a person who wants to transfer
 * GameTokens to someone, create a approval(signs it with metamask or wallet) without
 * sending a transaction to blockchain(to transaction fee).
 * Instead approval is sent by email of any other off-chain method to the receiver.
 * The receiver than submits approval(pays transaction fee), thus changes allowance.
 *
 * @example
 * Using off-chain approval to allow another account `spender` to use own token.
 * ```
 * const gameToken = await GameToken.create(signer, gameTokenAccoundId);
 * const offChainApproval = await gameToken.createSignedApproval(
 *   spender,
 *   12345,
 *   deadline: Math.round(Date.now()/1000)+60x60,
 * )
 * // send `offChainApproval` to second side off-chain(via email);
 * // `sender`'s side:
 * const gameToken = await GameToken.create(spenderSigner, gameTokenAccoundId);
 * async submitSignedApproval(offChainApproval)
 * // allowance to spend tokens by `spender` is altered.
 * ```
 */
export class GameToken {
  private readonly signerUtils: SignerUtils;
  private readonly gameTokenContract: GameTokenContract;
  readonly tokenMetaInfo: ERC20MetaInfo;

  private constructor(
    signerUtils: SignerUtils,
    gameTokenContract: GameTokenContract,
    tokenMetaInfo: ERC20MetaInfo,
  ) {
    this.signerUtils = signerUtils;
    this.gameTokenContract = gameTokenContract;
    this.tokenMetaInfo = tokenMetaInfo;
  }

  static async create(signer: Signer, gameTokenContractAccountId: AccountId) {
    const signerUtils = new SignerUtils(signer);
    const gameTokenContract = new ContractResolver(signer).resolve(
      'GameToken',
      await signerUtils.parseAddress(gameTokenContractAccountId),
    );
    const [symbol, name, decimals, totalSupply] = await Promise.all([
      gameTokenContract.symbol(),
      gameTokenContract.name(),
      gameTokenContract.decimals(),
      gameTokenContract.totalSupply(),
    ]);
    const metaInfo: ERC20MetaInfo = {
      symbol,
      name,
      decimals,
      totalSupply,
    };
    return new GameToken(signerUtils, gameTokenContract, metaInfo);
  }

  /**
   * Returns balance of `who`.
   */
  getBalanceOf = async (who: AccountId) =>
    this.gameTokenContract.balanceOf(await this.signerUtils.parseAddress(who));

  /**
   * Transfers own `amount` tokens to `to`.
   */
  transfer = async (to: AccountId, amount: BigNumberish) =>
    await this.gameTokenContract.transfer(
      await this.signerUtils.parseAddress(to),
      amount,
    );

  /**
   * Burns own `amount` tokens.
   */
  burnToken = async (amount: BigNumberish) =>
    await this.gameTokenContract.burn(amount);

  /**
   * Allows `spender` to spend own `amount` tokens.
   */
  approve = async (spender: AccountId, amount: BigNumberish) =>
    await this.gameTokenContract.approve(
      await this.signerUtils.parseAddress(spender),
      amount,
    );

  /**
   * Addes up `amount` to current value of how much `spender` is
   * allowed to spend of own tokens.
   */
  increaseAllowance = async (spender: AccountId, amount: BigNumberish) =>
    await this.gameTokenContract.increaseAllowance(
      await this.signerUtils.parseAddress(spender),
      amount,
    );

  /**
   * Subtracts `amount` from current value of how much `spender` is
   * allowed to spend of own tokens.
   */
  decreaseAllowance = async (spender: AccountId, amount: BigNumberish) =>
    await this.gameTokenContract.decreaseAllowance(
      await this.signerUtils.parseAddress(spender),
      amount,
    );

  /**
   * Returns how much tokens of `owner` can be spend by a `spender`.
   */
  getAllowance = async (owner: AccountId, spender: AccountId) =>
    this.gameTokenContract.allowance(
      await this.signerUtils.parseAddress(owner),
      await this.signerUtils.parseAddress(spender),
    );

  /**
   *
   * Returns nonce of `who`.
   *
   * @remarks
   * Nonce is used to create off-chain approvals.
   *
   * @see {@link GameToken.createSignedApproval}.
   *
   */
  private getNonceOf = async (who: AccountId) =>
    this.gameTokenContract.nonces(await this.signerUtils.parseAddress(who));

  /**
   *
   * Return own nonce.
   *
   * @remarks
   * See {@link getNonceOf}.
   *
   */
  private async getOwnNonce() {
    const ownAccountId = await this.signerUtils.createAccountIdFromAddress(
      await this.signerUtils.signer.getAddress(),
    );
    return this.getNonceOf(ownAccountId);
  }

  /**
   *
   * Create an object of type {@link ERC20SignedApproval}.
   *
   * @remarks
   * Returned object should be passed to {@link submitSignedApproval}
   *
   * @remarks
   * Owner can only create approval to use owner's tokens.
   * There is no way to create approval to use other's tokens
   * that you are allowed to use.
   *
   * @param deadline is seconds from epoch until this allowancePermit is valid
   * ex: deadline = Math.round(Date.now()/1000)+60x60 - meaning anyone
   * will be able to submit this approval for 1 hour(60x60 seconds)
   *
   */
  async createSignedApproval(
    spender: AccountId,
    amount: BigNumberish,
    deadline: BigNumberish,
  ) {
    const ownerAddress = await this.signerUtils.signer.getAddress();
    const spenderAddress = await this.signerUtils.parseAddress(spender);
    const value = BigNumber.from(amount);
    const signature = await this.signerUtils.signer._signTypedData(
      {
        name: this.tokenMetaInfo.name,
        version: '1',
        chainId: await this.signerUtils.getSignerChainId(),
        verifyingContract: this.gameTokenContract.address,
      },
      APPROVAL_MESSAGE_TYPES_DEFINITION,
      {
        owner: ownerAddress,
        spender: spenderAddress,
        value,
        nonce: await this.getOwnNonce(),
        deadline,
      },
    );
    const result: ERC20SignedApproval = {
      owner: await this.signerUtils.createAccountIdFromAddress(ownerAddress),
      spender: await this.signerUtils.createAccountIdFromAddress(
        spenderAddress,
      ),
      amount: BigNumber.from(amount),
      deadline: BigNumber.from(deadline),
      signature,
    };
    return result;
  }

  /**
   * Submits {@link ERC20SignedApproval} to blockchain.
   */
  async submitSignedApproval(approval: ERC20SignedApproval) {
    const ownerAddress = await this.signerUtils.parseAddress(approval.owner);
    const spenderAddress = await this.signerUtils.parseAddress(
      approval.spender,
    );
    const amount = BigNumber.from(approval.amount);
    const deadline = BigNumber.from(approval.deadline);
    const signature: Signature = ethers.utils.splitSignature(
      approval.signature,
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
   * Transfers owners token `amount` to `to`.
   *
   * @remarks
   * Sender should be allowed to spend these tokens
   */
  transferFrom = async (
    fromAddress: AccountId,
    to: AccountId,
    amount: BigNumberish,
  ) =>
    await this.gameTokenContract.transferFrom(
      await this.signerUtils.parseAddress(fromAddress),
      await this.signerUtils.parseAddress(to),
      amount,
    );

  /**
   * Burns tokens from `owner`
   *
   * @remarks
   * `sender` should be allowed to burn `owner's` token using methods:
   * - {@link increaseAllowance}
   * - {@link approve}
   * - {@link submitSignedApproval}
   */
  burnTokenFrom = async (owner: AccountId, amount: BigNumberish) =>
    await this.gameTokenContract.burnFrom(
      await this.signerUtils.parseAddress(owner),
      amount,
    );

  /**
   * Moves GameToken contract to paused state.
   */
  pauseToken = () => this.gameTokenContract.pause();

  /**
   * Checks if GameToken contract is in paused state.
   */
  isTokenPaused = () => this.gameTokenContract.paused();

  /**
   * Moves GameToken contract to unpaused state.
   */
  unpauseToken = () => this.gameTokenContract.unpause();

  /**
   * Recovers miss-transfer.
   *
   * @remarks
   * If someone sent {@link transfer}/{@link transferFrom} etc. to address
   * of gameToken contract itself, Only {@link Roles | Admin} can recover it by
   * providing related information.
   *
   * @remarks
   * There should be enough tokens on contract's balance.
   * `Admin` might use any `amount`. The only limitation is
   * getBalanceOf(contract) should contain such `amount`.
   */
  recover = async (
    addressOfTokenToRecover: AccountId,
    whoSentAddress: AccountId,
    amount: BigNumberish,
  ) =>
    await this.gameTokenContract.recover(
      await this.signerUtils.parseAddress(addressOfTokenToRecover),
      await this.signerUtils.parseAddress(whoSentAddress),
      amount,
    );

  private parsePayee = async (
    payee: Payee,
  ): Promise<GameTokenContract.PayeeStruct> => {
    if (payee.amount <= 0)
      throw new GeneralError(
        ErrorCodes.bad_input,
        "Payee's amount should be positive. " + 'But got ' + payee.amount,
      );
    return {
      amount: payee.amount,
      account: await this.signerUtils.parseAddress(payee.accountId),
    };
  };

  private mergePayees = (
    payees: GameTokenContract.PayeeStruct[],
  ): GameTokenContract.PayeeStruct[] => {
    const map = new Map<string, GameTokenContract.PayeeStruct>();
    for (const payee of payees) {
      const before = map.get(payee.account);
      if (!before) {
        map.set(payee.account, payee);
        continue;
      }
      before.amount = BigNumber.from(before.amount).add(payee.amount);
    }
    return Array.from(map.values());
  };

  /**
   *
   * Batch equivalent of {@link transfer}.
   *
   * @param mergeDuplicates
   * Default to `false`. If true, then all duplicate `payees` by account id
   * are merged into a single entry.
   *
   */
  transferBatch = async (payees: Payee[], mergeDuplicates = false) => {
    let _payees = await Promise.all(payees.map((x) => this.parsePayee(x)));
    if (mergeDuplicates) _payees = this.mergePayees(_payees);
    return await this.gameTokenContract.transferBatch(_payees);
  };

  /**
   * Batch equivalent of {@link transferFrom}.
   *
   * @see {@link transferBatch}.
   */
  transferBatchFrom = async (
    from: AccountId,
    payees: Payee[],
    mergeDuplicates = false,
  ) => {
    let _payees = await Promise.all(payees.map((x) => this.parsePayee(x)));
    if (mergeDuplicates) _payees = this.mergePayees(_payees);
    return await this.gameTokenContract.transferFromBatch(
      await this.signerUtils.parseAddress(from),
      _payees,
    );
  };
}
