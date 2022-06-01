import { AccountId, ChainId } from 'caip';
import { ethers } from 'ethers';

import { CHAIN_STANDARD } from './constants';
import { ErrorCodes, GeneralError } from './errors';
import { Address, Signer } from './types';

/**
 * Class provides utility methods related to {@link Signer},
 * {@link Address}, {@link https://www.npmjs.com/package/caip | `AccountId`}
 */
export class SignerUtils {
  readonly signer: Signer;
  constructor(signer: Signer) {
    this.signer = signer;
  }

  /**
   * @see {@link SignerUtils.getSignerChainId} Where property is used.
   */
  private signerChainId?: string;
  /**
   * @returns chain id of the {@link SignerUtils.signer}'s network.
   *
   * @remarks
   * Chain id is cached, so it asynchronously calles node only once,
   * and all of the subsequent operations are fast because of the cache.
   *
   */
  public async getSignerChainId() {
    if (typeof this.signerChainId !== 'undefined') return this.signerChainId;
    const chainId = await this.signer.getChainId();
    this.signerChainId = chainId.toString();
    return this.signerChainId;
  }

  /**
   * Transform {@link https://www.npmjs.com/package/caip | `caip.AccountId`}
   * to {@link Address}.
   *
   * @returns Plain address parsed from {@link AccountId}.
   *
   * @remarks
   * Checks if address is compatible with signer's network.
   *
   * @throws {@link GeneralError | unsupported_chain_standard}
   * If address does not match the signer.
   *
   * @throws {@link GeneralError | accounts_not_on_the_same_chain}
   * If provided address is not on the same network with signer.
   *
   * @example
   * ```
   * const accountId = new AccountId(
   *   'eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb'
   * );
   * const signerUtils = new SignerUtils(signer);
   * const address = await signerUtils.parseAddress(accountId)
   * console.log(address); // 0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb
   * ```
   */
  public async parseAddress(accountId: AccountId) {
    if (accountId.chainId.namespace !== CHAIN_STANDARD) {
      throw new GeneralError(
        ErrorCodes.unsupported_chain_standard,
        `Provided chain standart(${accountId.chainId.namespace}) ` +
          `is not supported. Should be ${CHAIN_STANDARD}.`,
      );
    }
    const signerChainId = await this.getSignerChainId();
    if (signerChainId !== accountId.chainId.reference) {
      throw new GeneralError(
        ErrorCodes.accounts_not_on_the_same_chain,
        `signer chain(${signerChainId}) != ` +
          `account id chain(${accountId.chainId.reference})`,
      );
    }
    const address = ethers.utils.getAddress(accountId.address);
    return address;
  }

  /**
   * @returns Provider related to a {@link SignerUtils.signer}.
   *
   * @throws {@link GeneralError | provider_not_available}
   * If provided is not available.
   */
  public getProvider() {
    if (!this.signer.provider)
      throw new GeneralError(ErrorCodes.provider_not_available);
    return this.signer.provider;
  }

  /**
   *
   * @returns
   * {@link https://www.npmjs.com/package/caip | `caip.AccountId`} created
   * from the {@link Address}.
   *
   * @remarks
   * Uses {@link SignerUtils.signer}'s chain id when transforming.
   *
   * @example
   * Create account id from the signer chain id and address.
   * ```
   * const signer = window.signer; // with chain id `eip155:1`
   * const signerUtils = new SignerUtils(signer);
   * const address = '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb';
   * const accountId = signerUtils.createAccountIdFromAddress(address);
   * console.log(accountId.toString());
   * // prints 'eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb'
   * ```
   */
  async createAccountIdFromAddress(address: Address): Promise<AccountId> {
    const validatedAddress = ethers.utils.getAddress(address);
    return new AccountId({
      address: validatedAddress,
      chainId: new ChainId({
        namespace: CHAIN_STANDARD,
        reference: await this.getSignerChainId(),
      }),
    });
  }
}
