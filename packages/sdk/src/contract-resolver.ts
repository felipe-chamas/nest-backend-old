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
  getNFTClaim = (address: Address) =>
    typechain.NFTClaim__factory.connect(address, this.signer);
  getNFTUnbox = (address: Address) =>
    typechain.NFTUnboxing__factory.connect(address, this.signer);

}
