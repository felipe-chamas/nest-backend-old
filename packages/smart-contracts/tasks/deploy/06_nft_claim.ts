import { task, types } from 'hardhat/config';
import { NFTClaimConstructor } from '../types';

export const TASK_DEPLOY_NFT_CLAIM = 'deploy:nft-claim';

task(TASK_DEPLOY_NFT_CLAIM, 'Deploy NFT Claim contract')
  .addParam('acl', 'ACL contract address', undefined, types.string)
  .addParam('nft', 'NFT contract', undefined, types.string)
  .setAction(async ({ acl, nft }: NFTClaimConstructor, { upgrades, ethers }) => {
    const nftClaim = await upgrades.deployProxy(await ethers.getContractFactory('NFTClaim'), [nft, acl], {
      kind: 'uups',
      initializer: 'initialize',
    });

    return nftClaim.address;
  });

export {};
