import { task, types } from 'hardhat/config';
import { NFTClaimConstructor } from '../types';

export const TASK_DEPLOY_NFT_CLAIM = 'deploy:nft-claim';

task(TASK_DEPLOY_NFT_CLAIM, 'Deploy NFT Claim contract')
  .addParam('acl', 'ACL contract address', undefined, types.string)
  .addParam('nft', 'NFT contract', undefined, types.string)
  .addOptionalParam('silent', 'Silent', false, types.boolean)
  .setAction(async ({ acl, nft, silent }: NFTClaimConstructor, { upgrades, ethers }) => {
    const nftClaim = await upgrades.deployProxy(await ethers.getContractFactory('NFTClaim'), [nft, acl], {
      kind: 'uups',
      initializer: 'initialize',
    });

    if (!silent) {
      console.log(`NFT Claim is deployed to: ${nftClaim.address}`);
    }

    return nftClaim.address;
  });

export {};
