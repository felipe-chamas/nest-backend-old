import { AccountId, ChainId } from 'caip';
import { BaseService } from './base-service';
import { Address } from '../types';
import { CHAIN_STANDARD } from '../constants';

export class Utils extends BaseService {

  createAccountIdFromAddress(address: Address): AccountId {
    const validatedAddress = this.parseAddress(address);
    return new AccountId({
      address: validatedAddress,
      chainId: new ChainId({
        namespace: CHAIN_STANDARD,
        reference: this.params.signerChainId,
      }),
    });
  }

}
