import { task, types } from 'hardhat/config';
import { NFTBoxConstructor } from '../types';

export const TASK_DEPLOY_NFT_BOX = 'deploy:nft-box';

task(TASK_DEPLOY_NFT_BOX, 'Deploy NFT Box contract')
  .addParam('acl', 'ACL contract address', undefined, types.string)
  .addParam('name', 'Token name', undefined, types.string)
  .addParam('symbol', 'Token symbol', undefined, types.string)
  .addOptionalParam('baseUri', 'Base Token URI', '', types.string)
  .addOptionalParam('silent', 'Silent', false, types.boolean)
  .setAction(async ({ acl, name, symbol, baseUri, silent }: NFTBoxConstructor, { upgrades, ethers }) => {
    const nft = await upgrades.deployProxy(await ethers.getContractFactory('NFTBox'), [name, symbol, baseUri, acl], {
      kind: 'uups',
      initializer: 'initialize',
    });

    if (!silent) {
      console.log(`NFT Box is deployed to: ${nft.address}`);
    }

    return nft.address;
  });

export {};
