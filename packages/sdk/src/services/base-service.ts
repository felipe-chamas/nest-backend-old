import { ethers } from 'ethers';
import { AccountId } from 'caip';
import { Address, AddressLike, Signer } from '../types';
import { AccountsNotOnTheSameChainError, GeneralError } from '../errors';
import { CHAIN_STANDARD } from '../constants';
import { ContractResolver } from '../contract-resolver';


export interface BaseServiceParams {
  signerChainId: string,
  signerAddress: string,
  signer: Signer,
  contractResolver: ContractResolver
}

export class BaseService {

  constructor(protected readonly params: BaseServiceParams) {}

  protected isAccountFromSignerChain(accountId: AccountId) {
    return accountId.chainId.reference === this.params.signerChainId;
  }

  protected validateAccountAgainstSignerChain(accountId: AccountId) {
    if (accountId.chainId.namespace !== CHAIN_STANDARD) {
      throw new GeneralError(
        'unsupported_chain_standard',
        `provided chain standart: ${accountId.chainId.namespace} ` +
        `supported: ${CHAIN_STANDARD}`,
      );
    }
    if (!this.isAccountFromSignerChain(accountId)) {
      throw new AccountsNotOnTheSameChainError(
        'signer', this.params.signerChainId,
        'contract', accountId.chainId.reference,
      );
    }
  }

  private getAddressFromAccountIdWithThrow(accountId: AccountId): Address {
    this.validateAccountAgainstSignerChain(accountId);
    return accountId.address;
  }

  /**
   *
   * Accepts `AddressLike` which is broad type that describes address.
   *
   * This method tries to parse `address`. If object is parseable
   * to plain `Address`(string), than `Address` is returned, otherwise
   * Error is thrown.
   *
   */
  protected parseAddress(address: AddressLike) {
    let rawAddress: string;
    if (address instanceof AccountId)
      rawAddress = this.getAddressFromAccountIdWithThrow(address);
    else
      rawAddress = address;
    return ethers.utils.getAddress(rawAddress);
  }

}
