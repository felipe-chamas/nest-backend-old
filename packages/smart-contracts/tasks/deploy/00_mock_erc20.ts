import { task, types } from 'hardhat/config';
import { ERC20Mock__factory } from '../../typechain/factories/ERC20Mock__factory';

export const TASK_DEPLOY_MOCK_ERC20 = 'deploy:mock-erc20';

task(TASK_DEPLOY_MOCK_ERC20, 'Deploy the mocked ERC20 token')
  .addParam('name', 'Token name', undefined, types.string)
  .addParam('symbol', 'Token symbol', undefined, types.string)
  .addOptionalParam('decimals', 'Token decimals', 18, types.int)
  .addParam('supply', 'Token supply', undefined, types.string)
  .setAction(
    async (
      { name, symbol, decimals, supply }: { name: string; symbol: string; decimals: number; supply: string },
      hre,
    ) => {
      const [deployer] = await hre.ethers.getSigners();

      const token = await new ERC20Mock__factory(deployer).deploy(name, symbol, decimals, supply);

      return token.address;
    },
  );

export {};
