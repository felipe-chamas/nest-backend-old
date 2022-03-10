import { task, types } from 'hardhat/config';
import { constants } from 'ethers';

export const TASK_DEPLOY_ACL = 'deploy:acl';

task(TASK_DEPLOY_ACL, 'Deploy ACL contract')
  .addParam('admin', 'Admin address', undefined, types.string)
  .addOptionalParam('operator', 'Operator address', constants.AddressZero, types.string)
  .setAction(async ({ admin, operator }: { admin: string; operator: string }, { upgrades, ethers }) => {
    const acl = await upgrades.deployProxy(await ethers.getContractFactory('ACL'), [admin, operator], {
      kind: 'uups',
      initializer: 'initialize',
    });

    return acl.address;
  });

export {};
