import { task, types } from 'hardhat/config';
import { NFTConstructor } from '../types';

export const TASK_DEPLOY_NFT = 'deploy:nft';

task(TASK_DEPLOY_NFT, 'Deploy NFT contract')
  .addParam('acl', 'ACL contract address', undefined, types.string)
  .addParam('name', 'Token name', undefined, types.string)
  .addParam('symbol', 'Token symbol', undefined, types.string)
  .addOptionalParam('baseUri', 'Base Token URI', '', types.string)
  .addOptionalParam('maxTokenSupply', 'Maximum token supply', (2n ** 256n - 1n).toString(10), types.string)
  .addOptionalParam('silent', 'Silent', false, types.boolean)
  .addOptionalParam('burnEnabled', 'Enable Token burning (Needs to be "true" for NFT Boxes)', false, types.boolean)
  .setAction(
    async (
      { acl, name, symbol, baseUri, maxTokenSupply, silent, burnEnabled }: NFTConstructor,
      { upgrades, ethers },
    ) => {
      const nft = await upgrades.deployProxy(
        await ethers.getContractFactory('NFT'),
        [name, symbol, baseUri, maxTokenSupply, burnEnabled, acl],
        {
          kind: 'uups',
          initializer: 'initialize',
        },
      );

      if (!silent) {
        console.log(`NFT deployed to: ${nft.address}`);
      }

      return nft.address;
    },
  );

export {};
