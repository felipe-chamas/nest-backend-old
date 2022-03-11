import { task, types } from 'hardhat/config';

export const TASK_DEPLOY_NFT = 'deploy:nft';

task(TASK_DEPLOY_NFT, 'Deploy NFT contract')
  .addParam('acl', 'ACL contract address', undefined, types.string)
  .addParam('name', 'Token name', undefined, types.string)
  .addParam('symbol', 'Token symbol', undefined, types.string)
  .addOptionalParam('baseUri', 'Base Token URI', '', types.string)
  .addOptionalParam('maxTokenSupply', 'Maximum token supply', (2n ** 256n - 1n).toString(10), types.string)
  .setAction(
    async (
      {
        acl,
        name,
        symbol,
        baseUri,
        maxTokenSupply,
      }: { acl: string; name: string; symbol: string; baseUri: string; maxTokenSupply: string },
      { upgrades, ethers },
    ) => {
      const nft = await upgrades.deployProxy(
        await ethers.getContractFactory('NFT'),
        [name, symbol, baseUri, maxTokenSupply, acl],
        {
          kind: 'uups',
          initializer: 'initialize',
        },
      );

      return nft.address;
    },
  );

export {};
