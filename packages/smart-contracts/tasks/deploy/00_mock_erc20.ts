import { task, types } from 'hardhat/config';
import { ERC20MockConstructor } from '../types';

export const TASK_DEPLOY_MOCK_ERC20 = 'deploy:mock-erc20';

task(TASK_DEPLOY_MOCK_ERC20, 'Deploy the mocked ERC20 token')
  .addParam('name', 'Token name', undefined, types.string)
  .addParam('symbol', 'Token symbol', undefined, types.string)
  .addOptionalParam('decimals', 'Token decimals', 18, types.int)
  .addParam('supply', 'Token supply', undefined, types.string)
  .setAction(async ({ name, symbol, decimals, supply }: ERC20MockConstructor, { ethers }) => {
    const [deployer] = await ethers.getSigners();

    const token = await (await ethers.getContractFactory('ERC20Mock', deployer)).deploy(name, symbol, decimals, supply);

    return token.address;
  });

export {};
