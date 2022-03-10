import { task, types } from 'hardhat/config';

export const TASK_DEPLOY_NFT = 'deploy:nft';

task(TASK_DEPLOY_NFT, 'Deploy NFT contract')
  .addParam('acl', 'ACL contract address', undefined, types.string)
  .addParam('name', 'Token name', undefined, types.string)
  .addParam('symbol', 'Token symbol', undefined, types.string)
  .setAction(async ({ acl, name, symbol }: { acl: string; name: string; symbol: string }, { upgrades, ethers }) => {
    const nft = await upgrades.deployProxy(await ethers.getContractFactory('NFT'), [name, symbol, acl], {
      kind: 'uups',
      initializer: 'initialize',
    });

    return nft.address;
  });

export {};
