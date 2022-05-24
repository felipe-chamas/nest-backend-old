import { task, types } from 'hardhat/config';
import { StakingConstructor } from '../types';

export const TASK_DEPLOY_STAKING = 'deploy:staking';

task(TASK_DEPLOY_STAKING, 'Deploy Staking contract')
  .addParam('acl', 'ACL contract address', undefined, types.string)
  .addParam('nftStake', 'NFT contract', undefined, types.string)
  .addParam('custody', 'custody address', undefined, types.string)
  .addParam('tokenContract', 'Token contract', undefined, types.string)
  .addOptionalParam('silent', 'Silent', false, types.boolean)
  .setAction(async ({ nftStake, tokenContract, custody, acl, silent }: StakingConstructor, { upgrades, ethers }) => {
    const staking = await upgrades.deployProxy(
      await ethers.getContractFactory('Staking'),
      [nftStake, tokenContract, custody, acl],
      {
        kind: 'uups',
        initializer: 'initialize',
      },
    );

    await staking.deployed();

    if (!silent) {
      console.log(`Staking is deployed to: ${staking.address}`);
    }

    return staking.address;
  });

export {};
