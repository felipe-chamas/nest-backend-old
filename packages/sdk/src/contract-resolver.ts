import { Signer } from './types';
import * as typechain from './typechain';
import { Address } from './index';

export class ContractResolver {

  constructor(private readonly signer: Signer) {}
  getACL = (address: Address) =>
    typechain.ACL__factory.connect(address, this.signer);
  getGameToken = (address: Address) =>
    typechain.GameToken__factory.connect(address, this.signer);
  getNFT = (address: Address) =>
    typechain.NFT__factory.connect(address, this.signer);

}
