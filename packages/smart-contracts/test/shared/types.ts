import { MockContract } from '@defi-wonderland/smock';
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import type { Fixture } from 'ethereum-waffle';
import { ACL, ERC20Mock, ERC20TokenRecoverable, GameToken, GodModeTokenSale, NFT, TokenSale } from '../../typechain';

declare module 'mocha' {
  interface Context {
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
    roles: Record<string, string>;
    contracts: Contracts;
    mocks: Mocks;
    godMode: GodMode;
  }
}

export interface Contracts {
  mockToken: ERC20Mock;
  acl: ACL;
  nft: NFT;
  gameToken: GameToken;
  recoverable: ERC20TokenRecoverable;
  tokenSale: TokenSale;
}

export interface Mocks {
  erc20: MockContract<ERC20Mock>;
  tokenSale: MockContract<TokenSale>;
}

export interface GodMode {
  tokenSale: GodModeTokenSale;
}

export interface Signers {
  admin: SignerWithAddress;
  operator: SignerWithAddress;
  other: SignerWithAddress;
  stranger: SignerWithAddress;
  custody: SignerWithAddress;
  user: SignerWithAddress;
}
