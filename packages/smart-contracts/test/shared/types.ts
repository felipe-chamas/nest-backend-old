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
  INFTPermitMock,
  MarketplaceMock,
  NFT,
  NFTClaim,
  NFTUnboxing,
  OrderValidatorMock,
  Splitter,
  TokenSale,
  VRFCoordinatorV2Mock,
  Staking,
  NFTLaunchpad,
} from '../../typechain';
import { solidityId } from './utils';

declare module 'mocha' {
  interface Context {
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
    contracts: Contracts;
    mocks: Mocks;
    godMode: GodMode;
    chainId: number;
  }
}

export interface Contracts {
  mockToken: ERC20Mock;
  acl: ACL;
  splitter: Splitter;
  staking: Staking;
  nft: NFT;
  nftLaunchpad: NFTLaunchpad;
  gameToken: GameToken;
  recoverable: ERC20TokenRecoverable;
  accessControllable: AccessControllable;
  tokenSale: TokenSale;
  nftClaim: NFTClaim;
  nftUnboxing: NFTUnboxing;
  vrfCoordinator: VRFCoordinatorV2Mock;
  collection: NFT[];
  nftPermit: INFTPermitMock;
  marketplace: MarketplaceMock;
  orderValidatorMock: OrderValidatorMock;
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
  launchpad: SignerWithAddress;
}

export const Roles: Record<string, string> = {
  ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
  OPERATOR_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OPERATOR_ROLE')),
  OWNER_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OWNER_ROLE')),
  MINTER_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE')),
} as const;

export const AssetsTypes: Record<string, string> = {
  ERC20: solidityId('ERC20'),
  ERC721: solidityId('ERC721'),
  UNDEFINED: solidityId('UNDEFINED'),
};

export interface ERC4494PermitMessage {
  spender: string;
  tokenId: number | string;
  nonce: number | string;
  deadline: number | string;
}

export interface Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}
