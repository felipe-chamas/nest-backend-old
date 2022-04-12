import { task, types } from 'hardhat/config';

export const TASK_ACL_REVOKE_ROLE = 'tx:acl-revoke-role';

task(TASK_ACL_REVOKE_ROLE, 'ACL revoke role')
  .addParam('acl', 'ACL Contract Address', undefined, types.string)
  .addParam('role', 'Role hash', undefined, types.string)
  .addParam('from', 'Target address', undefined, types.string)
  .setAction(async ({ acl, from, role }, { ethers }) => {
    const [operator] = await ethers.getSigners();

    const factory = await ethers.getContractFactory('ACL', operator);

    const tx = await factory.attach(acl).revokeRole(role, from);

    console.log(`Revoke Role Transaction: ${tx.hash}`);
  });

export {};
