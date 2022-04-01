import { task, types } from 'hardhat/config';
import { constants } from 'ethers';
import { ACLConstructor } from '../types';

export const TASK_DEPLOY_ACL = 'deploy:acl';

task(TASK_DEPLOY_ACL, 'Deploy ACL contract')
  .addParam('admin', 'Admin address', undefined, types.string)
  .addOptionalParam('operator', 'Operator address', constants.AddressZero, types.string)
  .setAction(async ({ admin, operator }: ACLConstructor, { upgrades, ethers }) => {
    const acl = await upgrades.deployProxy(await ethers.getContractFactory('ACL'), [admin, operator], {
      kind: 'uups',
      initializer: 'initialize',
    });

    return acl.address;
  });

export {};
