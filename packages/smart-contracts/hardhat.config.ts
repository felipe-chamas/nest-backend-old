import * as dotenv from 'dotenv';

import '@typechain/hardhat';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@openzeppelin/hardhat-upgrades';
import { privateKey } from './utils/network';

import './tasks';

const env = dotenv.config();

const HH_MNEMONIC = 'test test test test test test test test test test test junk';
const MNEMONIC = env.parsed?.MNEMONIC || HH_MNEMONIC;

const config: HardhatUserConfig = {
  mocha: {
    bail: true,
  },
  solidity: {
    compilers: [
      {
        version: '0.8.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
    settings: {
      outputSelection: {
        '*': {
          '*': ['storageLayout'],
        },
      },
    },
  },
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      chainId: 31337,
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
    binanceTestnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      accounts: privateKey('binanceTestnet'),
    },
  },
  gasReporter: {
    currency: 'USD',
    enabled: !!process.env.REPORT_GAS,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  typechain: {
    outDir: './typechain',
    target: 'ethers-v5',
  },
};

export default config;
