import { task, types } from 'hardhat/config';
import { GameToken__factory } from '../../typechain/factories/GameToken__factory';

task('deploy:game-token', 'Deploy the Game Token')
  .addParam('admin', 'Admin address', undefined, types.string)
  .addParam('name', 'Token name', undefined, types.string)
  .addParam('symbol', 'Token symbol', undefined, types.string)
  .addParam('supply', 'Token supply', undefined, types.string)
  .setAction(
    async ({ admin, name, symbol, supply }: { admin: string; name: string; symbol: string; supply: string }, hre) => {
      const [deployer] = await hre.ethers.getSigners();

      const token = await new GameToken__factory(deployer).deploy(admin, name, symbol, supply);

      return token.address;
    },
  );

export {};
