import { task, types } from 'hardhat/config';
import { constants } from 'ethers';
import { ACLConstructor } from '../types';

export const TASK_DEPLOY_ACL = 'deploy:acl';

task(TASK_DEPLOY_ACL, 'Deploy ACL contract')
  .addParam('admin', 'Admin address', undefined, types.string)
  .addOptionalParam('operator', 'Operator address', constants.AddressZero, types.string)
  .addOptionalParam('silent', 'Silent', false, types.boolean)
  .setAction(async function ({ admin, operator, silent }: ACLConstructor, { upgrades, ethers }) {
    const acl = await upgrades.deployProxy(await ethers.getContractFactory('ACL'), [admin, operator], {
      kind: 'uups',
      initializer: 'initialize',
    });

    if (!silent) {
      console.log(`ACL deployed to: ${acl.address}`);
    }

    return acl.address;
  });

export {};
