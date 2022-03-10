import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import hre, { ethers } from 'hardhat';
import { TASK_DEPLOY_ACL, TASK_DEPLOY_GAME_TOKEN, TASK_DEPLOY_MOCK_ERC20, TASK_DEPLOY_NFT } from '../../tasks';
import { ACL__factory, ERC20Mock__factory, GameToken__factory, NFT__factory } from '../../typechain';

export async function deployMockERC20(
  deployer: SignerWithAddress,
  name = 'Mock',
  symbol = 'MCK',
  supply = ethers.utils.parseEther('100000').toString(),
) {
  const address = await hre.run(TASK_DEPLOY_MOCK_ERC20, {
    name,
    symbol,
    supply,
  });

  return ERC20Mock__factory.connect(address, deployer);
}

export async function deployGameToken(
  deployer: SignerWithAddress,

  admin: string,
  acl: string,
  name = 'Test',
  symbol = 'TST',
  supply = ethers.utils.parseEther('100000').toString(),
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

export async function deployACL(deployer: SignerWithAddress, admin: string, operator: string) {
  const acl = await hre.run(TASK_DEPLOY_ACL, { admin, operator });

  return ACL__factory.connect(acl, deployer);
}

export async function deployNFT(deployer: SignerWithAddress, acl: string, name = 'Testing NFT', symbol = 'TNFT') {
  const nft = await hre.run(TASK_DEPLOY_NFT, { acl, name, symbol });

  return NFT__factory.connect(nft, deployer);
}
