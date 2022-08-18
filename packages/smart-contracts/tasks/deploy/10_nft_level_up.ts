import { task, types } from 'hardhat/config';
import { NFTLevelUpConstructor } from '../types';

export const TASK_DEPLOY_NFT_LEVEL_UP = 'deploy:nft-level-up';

task(TASK_DEPLOY_NFT_LEVEL_UP, 'Deploy NFT Level Up contract')
  .addParam('acl', 'ACL contract address', undefined, types.string)
  .addParam('levelUpValue', 'Value of leveling up an NFT', undefined, types.string)
  .addParam('receiver', 'Address to receive tokens when level up is requested', undefined, types.string)
  .addFlag('addToACL', 'Add NFT Level Up contract to MINTER_ROLE')
  .addOptionalParam('silent', 'Silent', false, types.boolean)
  .setAction(async ({ acl, levelUpValue, receiver, addToACL, silent }: NFTLevelUpConstructor, { upgrades, ethers }) => {
    const nftLevelUp = await upgrades.deployProxy(
      await ethers.getContractFactory('NFTLevelUp'),
      [levelUpValue, receiver, acl],
      {
        kind: 'uups',
        initializer: 'initialize',
      },
    );

    if (addToACL === true) {
      const aclFactory = await ethers.getContractFactory('ACL');
      await aclFactory
        .attach(acl)
        .grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE')), nftLevelUp.address);
    }
    if (!silent) {
      console.log(`NFT Level Up is deployed to: ${nftLevelUp.address}`);
    }

    return nftLevelUp.address;
  });

export {};
