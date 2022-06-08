import { Signer } from 'ethers';
import hre, { ethers, upgrades } from 'hardhat';
import {
  TASK_DEPLOY_ACL,
  TASK_DEPLOY_GAME_TOKEN,
  TASK_DEPLOY_MOCK_ERC20,
  TASK_DEPLOY_NFT,
  TASK_DEPLOY_NFT_BOX_UNBOXING,
  TASK_DEPLOY_NFT_CLAIM,
  TASK_DEPLOY_SPLITTER,
  TASK_DEPLOY_STAKING,
  TASK_DEPLOY_TOKEN_SALE,
} from '../../tasks';
import {
  ACLConstructor,
  AtLeast,
  ERC20MockConstructor,
  GameTokenConstructor,
  MarketplaceConstructor,
  NFTBoxUnboxingConstructor,
  NFTClaimConstructor,
  NFTConstructor,
  StakingConstructor,
  TokenSaleConstructor,
} from '../../tasks/types';
import {
  ACL__factory,
  ERC20Mock__factory,
  GameToken__factory,
  NFTClaim__factory,
  NFTMock,
  NFTMock__factory,
  NFTUnboxing__factory,
  NFT__factory,
  Splitter__factory,
  Staking__factory,
  TokenSale__factory,
  VRFCoordinatorV2Mock__factory,
} from '../../typechain';
import { MarketplaceMock__factory } from '../../typechain/factories/MarketplaceMock__factory';
import { OrderValidatorMock__factory } from '../../typechain/factories/OrderValidatorMock__factory';
import { MarketplaceMock } from '../../typechain/MarketplaceMock';
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
    silent,
  }: AtLeast<GameTokenConstructor, 'admin' | 'acl'>,
) {
  const address = await hre.run(TASK_DEPLOY_GAME_TOKEN, {
    admin,
    name,
    symbol,
    supply,
    acl,
    silent,
  });

  return GameToken__factory.connect(address, deployer);
}

export async function deployACL(deployer: Signer, args: ACLConstructor) {
  const acl = await hre.run(TASK_DEPLOY_ACL, { silent: true, ...args });

  return ACL__factory.connect(acl, deployer);
}

export async function deploySplitter(deployer: Signer) {
  const address = await hre.run(TASK_DEPLOY_SPLITTER);
  return Splitter__factory.connect(address, deployer);
}

export async function deployStaking(deployer: Signer, args: StakingConstructor) {
  const address = await hre.run(TASK_DEPLOY_STAKING, args);
  return Staking__factory.connect(address, deployer);
}

export async function deployNFT(
  deployer: Signer,
  {
    acl,
    name = 'Testing NFT',
    symbol = 'TNFT',
    baseUri = 'ipfs://',
    maxTokenSupply = MAX_UINT256.toString(10),
    burnEnabled,
    silent,
  }: AtLeast<NFTConstructor, 'acl'>,
) {
  const nft = await hre.run(TASK_DEPLOY_NFT, {
    acl,
    name,
    symbol,
    maxTokenSupply: maxTokenSupply,
    burnEnabled,
    baseUri,
    silent,
  });

  return NFT__factory.connect(nft, deployer);
}

export async function deployTokenSale(deployer: Signer, args: TokenSaleConstructor) {
  const tokenSale = await hre.run(TASK_DEPLOY_TOKEN_SALE, { silent: true, ...args });

  return TokenSale__factory.connect(tokenSale, deployer);
}

export async function deployNFTClaim(deployer: Signer, { acl, nft, silent }: NFTClaimConstructor) {
  const nftClaim = await hre.run(TASK_DEPLOY_NFT_CLAIM, {
    acl,
    nft,
    silent,
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
    silent: true,
  });

  return NFTUnboxing__factory.connect(nftUnboxing, deployer);
}

export async function deployNFTMock(
  deployer: Signer,
  {
    acl,
    name = 'Testing NFT',
    symbol = 'TNFT',
    baseUri = 'ipfs://',
    burnEnabled = true,
    maxTokenSupply = MAX_UINT256.toString(10),
  }: AtLeast<NFTConstructor, 'acl'>,
): Promise<NFTMock> {
  const nft = await upgrades.deployProxy(
    await ethers.getContractFactory('NFTMock'),
    [name, symbol, baseUri, maxTokenSupply, burnEnabled, acl],
    {
      kind: 'uups',
      initializer: 'initialize',
    },
  );

  return NFTMock__factory.connect(nft.address, deployer);
}

export async function deployNFTBoxMock(
  deployer: Signer,
  { acl, name = 'Testing NFT Box', symbol = 'NFTBOX', baseUri = 'ipfs://' }: AtLeast<NFTConstructor, 'acl'>,
): Promise<NFTMock> {
  const nft = await upgrades.deployProxy(await ethers.getContractFactory('NFTBoxMock'), [name, symbol, baseUri, acl], {
    kind: 'uups',
    initializer: 'initialize',
  });

  return NFTMock__factory.connect(nft.address, deployer);
}

export async function deployMarketplace(
  deployer: Signer,
  {
    acl,
    name = 'Marketplace',
    gameToken,
    erc20FeePercent = 20000,
    nftFee = ethers.utils.parseEther('1'),
    custody,
  }: AtLeast<MarketplaceConstructor, 'acl'>,
): Promise<MarketplaceMock> {
  const marketplace = await upgrades.deployProxy(
    await ethers.getContractFactory('MarketplaceMock'),
    [gameToken, name, erc20FeePercent, nftFee, custody, acl],
    {
      kind: 'uups',
      initializer: 'initialize',
    },
  );

  return MarketplaceMock__factory.connect(marketplace.address, deployer);
}

export async function deployOrderValidatorMock(
  deployer: Signer,
  { acl, name = 'Marketplace' }: { acl: string; name?: string },
) {
  const validator = await upgrades.deployProxy(await ethers.getContractFactory('OrderValidatorMock'), [name, acl], {
    kind: 'uups',
    initializer: 'initialize',
  });

  return OrderValidatorMock__factory.connect(validator.address, deployer);
}
