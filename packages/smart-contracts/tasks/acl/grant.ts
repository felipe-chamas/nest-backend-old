import { task, types } from 'hardhat/config';

export const TASK_ACL_GRANT_ROLE = 'tx:acl-grant-role';

task(TASK_ACL_GRANT_ROLE, 'ACL grant role')
  .addParam('acl', 'ACL Contract Address', undefined, types.string)
  .addParam('role', 'Role hash', undefined, types.string)
  .addParam('to', 'Target address', undefined, types.string)
  .setAction(async ({ acl, to, role }, { ethers }) => {
    const [operator] = await ethers.getSigners();

    const factory = await ethers.getContractFactory('ACL', operator);

    const tx = await factory.attach(acl).grantRole(role, to);

    console.log(`Grant Role Transaction: ${tx.hash}`);
  });

export {};
