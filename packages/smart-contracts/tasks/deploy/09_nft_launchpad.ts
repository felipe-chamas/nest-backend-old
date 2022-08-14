import { task, types } from 'hardhat/config';
import { NFTLaunchpadConstructor } from '../types';

export const TASK_DEPLOY_NFT_LAUNCHPAD = 'deploy:nft-launchpad';

task(TASK_DEPLOY_NFT_LAUNCHPAD, 'Deploy NFT Launchpad contract')
  .addParam('acl', 'ACL contract address', undefined, types.string)
  .addParam('name', 'Token name', undefined, types.string)
  .addParam('symbol', 'Token symbol', undefined, types.string)
  .addParam('launchpad', 'Launchpad contract address', undefined, types.string)
  .addParam('maxTokenSupply', 'Maximum token supply', undefined, types.string)
  .addOptionalParam('baseUri', 'Base Token URI', '', types.string)
  .addOptionalParam('silent', 'Silent', false, types.boolean)
  .addOptionalParam('burnEnabled', 'Enable Token burning (Needs to be "true" for NFT Boxes)', false, types.boolean)
  .setAction(
    async (
      { acl, name, symbol, launchpad, baseUri, maxTokenSupply, silent, burnEnabled }: NFTLaunchpadConstructor,
      { upgrades, ethers },
    ) => {
      const nftLaunchpad = await upgrades.deployProxy(
        await ethers.getContractFactory('NFTLaunchpad'),
        [name, symbol, baseUri, maxTokenSupply, burnEnabled, acl, launchpad],
        {
          kind: 'uups',
          initializer: 'initialize',
        },
      );

      if (!silent) {
        console.log(`NFT Launchpad deployed to: ${nftLaunchpad.address}`);
      }

      return nftLaunchpad.address;
    },
  );

export {};
