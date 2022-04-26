import '@nomiclabs/hardhat-ethers';
import '@typechain/hardhat';
import '@openzeppelin/hardhat-upgrades';
import { HardhatUserConfig } from 'hardhat/config';
import './tasks/deploy';

const config: HardhatUserConfig = {
  solidity: '0.8.12',
};

export default config;
