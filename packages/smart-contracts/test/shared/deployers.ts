import { Signer } from 'ethers';
import hre, { ethers } from 'hardhat';
import {
  TASK_DEPLOY_ACL,
  TASK_DEPLOY_GAME_TOKEN,
  TASK_DEPLOY_MOCK_ERC20,
  TASK_DEPLOY_NFT,
  TASK_DEPLOY_NFT_BOX,
  TASK_DEPLOY_NFT_BOX_UNBOXING,
  TASK_DEPLOY_NFT_CLAIM,
  TASK_DEPLOY_TOKEN_SALE,
} from '../../tasks';
import {
  ACLConstructor,
  AtLeast,
  ERC20MockConstructor,
  GameTokenConstructor,
  NFTBoxConstructor,
  NFTBoxUnboxingConstructor,
  NFTClaimConstructor,
  NFTConstructor,
  TokenSaleConstructor,
} from '../../tasks/types';
import {
  ACL__factory,
  ERC20Mock__factory,
  GameToken__factory,
  NFTBox__factory,
  NFTClaim__factory,
  NFTUnboxing__factory,
  NFT__factory,
  TokenSale__factory,
  VRFCoordinatorV2Mock__factory,
} from '../../typechain';
import { MAX_UINT256 } from './constants';

export async function deployMockERC20(
  deployer: Signer,
  {
    name = 'Mock',
    symbol = 'MCK',
    supply = (100_000n * 10n ** 18n).toString(),
    decimals = 18,
  }: Partial<ERC20MockConstructor>,
) {
  const address = await hre.run(TASK_DEPLOY_MOCK_ERC20, { name, symbol, supply, decimals });

  return ERC20Mock__factory.connect(address, deployer);
}

export async function deployGameToken(
  deployer: Signer,
  {
    admin,
    acl,
    name = 'Test',
    symbol = 'TST',
    supply = ethers.utils.parseEther('100000').toString(),
  }: AtLeast<GameTokenConstructor, 'admin' | 'acl'>,
) {
  const address = await hre.run(TASK_DEPLOY_GAME_TOKEN, {
    admin,
    name,
    symbol,
    supply,
    acl,
  });

  return GameToken__factory.connect(address, deployer);
}

export async function deployACL(deployer: Signer, args: ACLConstructor) {
  const acl = await hre.run(TASK_DEPLOY_ACL, args);

  return ACL__factory.connect(acl, deployer);
}

export async function deployNFT(
  deployer: Signer,
  {
    acl,
    name = 'Testing NFT',
    symbol = 'TNFT',
    baseUri = 'ipfs://',
    maxTokenSupply = MAX_UINT256.toString(10),
  }: AtLeast<NFTConstructor, 'acl'>,
) {
  const nft = await hre.run(TASK_DEPLOY_NFT, {
    acl,
    name,
    symbol,
    maxTokenSupply: maxTokenSupply,
    baseUri,
  });

  return NFT__factory.connect(nft, deployer);
}

export async function deployTokenSale(deployer: Signer, args: TokenSaleConstructor) {
  const tokenSale = await hre.run(TASK_DEPLOY_TOKEN_SALE, args);

  return TokenSale__factory.connect(tokenSale, deployer);
}

export async function deployNFTBox(
  deployer: Signer,
  { acl, name = 'Testing NFT Box', symbol = 'NFTBOX', baseUri = 'ipfs://' }: AtLeast<NFTBoxConstructor, 'acl'>,
) {
  const nft = await hre.run(TASK_DEPLOY_NFT_BOX, {
    acl,
    name,
    symbol,
    baseUri,
  });

  return NFTBox__factory.connect(nft, deployer);
}

export async function deployNFTClaim(deployer: Signer, { acl, nft }: NFTClaimConstructor) {
  const nftClaim = await hre.run(TASK_DEPLOY_NFT_CLAIM, {
    acl,
    nft,
  });

  return NFTClaim__factory.connect(nftClaim, deployer);
}

export async function deployVRFCoordinatorV2(deployer: Signer) {
  return await new VRFCoordinatorV2Mock__factory(deployer).deploy(0, 0);
}

export async function deployNFTUnboxing(
  deployer: Signer,
  { acl, vrfCoordinator, keyHash, nftBox, requestConfirmations, subscriptionId }: NFTBoxUnboxingConstructor,
) {
  const nftUnboxing = await hre.run(TASK_DEPLOY_NFT_BOX_UNBOXING, {
    acl,
    vrfCoordinator,
    keyHash,
    nftBox,
    requestConfirmations,
    subscriptionId,
  });

  return NFTUnboxing__factory.connect(nftUnboxing, deployer);
}
