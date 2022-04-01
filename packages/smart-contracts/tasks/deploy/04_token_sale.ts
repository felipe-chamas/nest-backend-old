import { task, types } from 'hardhat/config';
import { TokenSaleConstructor } from '../types';

export const TASK_DEPLOY_TOKEN_SALE = 'deploy:token-sale';

task(TASK_DEPLOY_TOKEN_SALE, 'Deploy Token Sale contract')
  .addParam('vestingPeriod', 'Vesting period (in seconds)', undefined, types.int)
  .addParam('custody', 'Game Token custody address', undefined, types.string)
  .addParam('gameToken', 'Game Token address', undefined, types.string)
  .addParam('paymentToken', 'Payment Token address', undefined, types.string)
  .addParam('acl', 'ACL contract address', undefined, types.string)
  .setAction(
    async ({ vestingPeriod, custody, acl, gameToken, paymentToken }: TokenSaleConstructor, { upgrades, ethers }) => {
      const nft = await upgrades.deployProxy(
        await ethers.getContractFactory('TokenSale'),
        [vestingPeriod, custody, gameToken, paymentToken, acl],
        {
          kind: 'uups',
          initializer: 'initialize',
        },
      );

      return nft.address;
    },
  );

export {};
