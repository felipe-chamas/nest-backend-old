import { task, types } from 'hardhat/config';
import { NFTBoxUnboxingConstructor } from '../types';

export const TASK_DEPLOY_NFT_BOX_UNBOXING = 'deploy:nft-box-unboxing';

task(TASK_DEPLOY_NFT_BOX_UNBOXING, 'Deploy NFT Box Unboxing contract')
  .addParam('acl', 'ACL contract address', undefined, types.string)
  .addParam('nftBox', 'NFT Box contract', undefined, types.string)
  .addFlag('addToACL', 'Add NFT Box Unboxing contract to MINTER_ROLE')
  .addOptionalParam('silent', 'Silent', false, types.boolean)
  .setAction(async ({ acl, nftBox, addToACL, silent }: NFTBoxUnboxingConstructor, { upgrades, ethers }) => {
    const nftUnboxing = await upgrades.deployProxy(await ethers.getContractFactory('NFTUnboxing'), [nftBox, acl], {
      kind: 'uups',
      initializer: 'initialize',
    });

    if (addToACL === true) {
      const aclFactory = await ethers.getContractFactory('ACL');
      await aclFactory
        .attach(acl)
        .grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE')), nftUnboxing.address);
    }
    if (!silent) {
      console.log(`NFT Box Unboxing is deployed to: ${nftUnboxing.address}`);
    }

    return nftUnboxing.address;
  });

export {};
