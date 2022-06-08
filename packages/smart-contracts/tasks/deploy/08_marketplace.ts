import { task, types } from 'hardhat/config';
import { MarketplaceConstructor } from '../types';

export const TASK_DEPLOY_MARKETPLACE = 'deploy:marketplace';

task(TASK_DEPLOY_MARKETPLACE, 'Deploy Marketplace contract')
  .addParam('acl', 'ACL contract address', undefined, types.string)
  .addParam('gameToken', 'Game Token contract address', undefined, types.string)
  .addParam('name', 'Marketplace name', undefined, types.string)
  .addParam(
    'erc20FeePercent',
    'Game Token fee percent. Has 4 decimal places. Specify 10025 if you want 1.0025%',
    undefined,
    types.int,
  )
  .addParam('nftFee', 'Fixed fee for including NFT in order', undefined, types.string)
  .addParam('custody', 'Custody address where all fees will be sent', undefined, types.string)
  .addOptionalParam('silent', 'Silent', false, types.boolean)
  .setAction(
    async (
      { acl, gameToken, name, erc20FeePercent, nftFee, custody, silent }: MarketplaceConstructor,
      { upgrades, ethers },
    ) => {
      const marketplace = await upgrades.deployProxy(
        await ethers.getContractFactory('Marketplace'),
        [gameToken, name, erc20FeePercent, nftFee, custody, acl],
        {
          kind: 'uups',
          initializer: 'initialize',
        },
      );

      if (!silent) {
        console.log(`Marketplace deployed to: ${marketplace.address}`);
      }

      return marketplace.address;
    },
  );

export {};
