import {
  expect,
} from './utils';

import {
  createSdk,
  constants,
} from '../';

import * as hre from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';


describe('utils service functionality', () => {

  let admin: SignerWithAddress;

  before('configure signer', async () => {
    [admin] = await hre.ethers.getSigners();
  });

  it(
    'should create caip format account id from plain string address',
    async () => {
      const sdk = await createSdk(admin);
      const chainId = await admin.getChainId();
      const utils = sdk.utils;
      const someAddress = '0x8ba1f109551bd432803012645ac136ddd64dba72';
      const result = utils.createAccountIdFromAddress(someAddress).toString();
      expect(result.toLowerCase())
        .to.include(someAddress.toLowerCase())
        .to.include(constants.CHAIN_STANDARD.toLowerCase())
        .to.include(chainId.toString().toLowerCase());
    },
  );

});
