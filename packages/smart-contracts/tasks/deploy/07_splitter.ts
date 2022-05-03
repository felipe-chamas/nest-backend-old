import { task, types } from 'hardhat/config';
import { SplitterConstructor } from '../types';

export const TASK_DEPLOY_SPLITTER = 'deploy:splitter';

task(TASK_DEPLOY_SPLITTER, 'Deploy Splitter contract')
  .addOptionalParam('silent', 'Silent', false, types.boolean)
  .setAction(async ({ silent }: SplitterConstructor, { ethers }) => {
    const Splitter = await ethers.getContractFactory('Splitter');
    const splitter = await Splitter.deploy();

    await splitter.deployed();

    if (!silent) {
      console.log(`Splitter is deployed to: ${splitter.address}`);
    }

    return splitter.address;
  });

export {};
