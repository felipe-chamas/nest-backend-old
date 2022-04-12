import { MockContract } from '@defi-wonderland/smock';
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import type { Fixture } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import {
  AccessControllable,
  ACL,
  ERC20Mock,
  ERC20TokenRecoverable,
  GameToken,
  GodModeTokenSale,
  NFT,
  NFTBox,
  NFTClaim,
  NFTUnboxing,
  TokenSale,
  VRFCoordinatorV2Mock,
} from '../../typechain';

declare module 'mocha' {
  interface Context {
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
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
  accessControllable: AccessControllable;
  tokenSale: TokenSale;
  nftBox: NFTBox;
  nftClaim: NFTClaim;
  nftUnboxing: NFTUnboxing;
  vrfCoordinator: VRFCoordinatorV2Mock;
  collection: NFT[];
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

export const Roles: Record<string, string> = {
  ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
  OPERATOR_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OPERATOR_ROLE')),
  OWNER_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OWNER_ROLE')),
  MINTER_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE')),
} as const;
