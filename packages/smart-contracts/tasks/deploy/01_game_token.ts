import { task, types } from 'hardhat/config';

task('deploy:game-token', 'Deploy the Game Token')
  .addParam('admin', 'Admin address', undefined, types.string)
  .addParam('name', 'Token name', undefined, types.string)
  .addParam('symbol', 'Token symbol', undefined, types.string)
  .addParam('supply', 'Token supply', undefined, types.string)
  .setAction(
    async (
      { admin, name, symbol, supply }: { admin: string; name: string; symbol: string; supply: string },
      { upgrades, ethers },
    ) => {
      const token = await upgrades.deployProxy(
        await ethers.getContractFactory('GameToken'),
        [admin, name, symbol, supply],
        {
          kind: 'uups',
          initializer: 'initialize',
        },
      );

      return token.address;
    },
  );

export {};
