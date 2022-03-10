import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import type { Fixture } from 'ethereum-waffle';
import { constants } from 'ethers';
import { ACL, ERC20Mock, ERC20TokenRecoverable, GameToken, NFT } from '../../typechain';

declare module 'mocha' {
  interface Context {
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
    roles: Record<string, string>;
    contracts: Contracts;
  }
}

export interface Contracts {
  mockToken: ERC20Mock;
  acl: ACL;
  nft: NFT;
  gameToken: GameToken;
  recoverable: ERC20TokenRecoverable;
}

export interface Signers {
  admin: SignerWithAddress;
  other: SignerWithAddress;
  stranger: SignerWithAddress;
}

export const AddressZero = constants.AddressZero;
