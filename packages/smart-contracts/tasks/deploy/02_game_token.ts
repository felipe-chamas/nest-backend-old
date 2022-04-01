import { task, types } from 'hardhat/config';
import { GameTokenConstructor } from '../types';

export const TASK_DEPLOY_GAME_TOKEN = 'deploy:game-token';

task(TASK_DEPLOY_GAME_TOKEN, 'Deploy the Game Token')
  .addParam('admin', 'Admin address', undefined, types.string)
  .addParam('name', 'Token name', undefined, types.string)
  .addParam('symbol', 'Token symbol', undefined, types.string)
  .addParam('supply', 'Token supply', undefined, types.string)
  .addParam('acl', 'ACL contract address', undefined, types.string)
  .setAction(async ({ admin, name, symbol, supply, acl }: GameTokenConstructor, { upgrades, ethers }) => {
    const token = await upgrades.deployProxy(
      await ethers.getContractFactory('GameToken'),
      [admin, name, symbol, supply, acl],
      {
        kind: 'uups',
        initializer: 'initialize',
      },
    );

    return token.address;
  });

export {};
