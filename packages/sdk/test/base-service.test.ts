import {
  createSdk,
  GeneralError,
  constants,
  Address,
  ErrorCodes,
} from '../';

import * as caip from 'caip';
import {
  runDeployTask,
  expect,
} from './utils';
import * as hre from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';


describe('base-service functionality', () => {

  let admin: SignerWithAddress;
  let operator: SignerWithAddress;
  let aclAddress: Address;


  before('configure contracts', async () => {
    [admin, operator] = await hre.ethers.getSigners();
    aclAddress = await runDeployTask(
      'acl',
      { admin: admin.address, operator: operator.address },
    );
  });


  it(
    'should fail to init service if unsupported chain standard provided',
    async () => {
      const sdk = await createSdk(admin);
      const chainId = await admin.getChainId();
      const wrongChainStandard = 'eip156';
      const accountId = new caip.AccountId({
        address: aclAddress,
        chainId: new caip.ChainId({
          namespace: wrongChainStandard,
          reference: chainId.toString(),
        }),
      });
      expect(() => sdk.createAccessControl(accountId))
        .to.throw(GeneralError, wrongChainStandard)
        .with.property('errorCode', ErrorCodes.unsupported_chain_standard);
    },
  );


  it(
    'should initialize service if address is provided as a plain string',
    async () => {
      const sdk = await createSdk(admin);
      expect(() => sdk.createAccessControl(aclAddress))
        .to.not.throw();
    },
  );


  it(
    'should initialize service if address is provided in caip format',
    async () => {
      const sdk = await createSdk(admin);
      const chainId = await admin.getChainId();
      const accountId = new caip.AccountId({
        address: aclAddress,
        chainId: new caip.ChainId({
          namespace: constants.CHAIN_STANDARD,
          reference: chainId.toString(),
        }),
      });
      expect(() => sdk.createAccessControl(accountId))
        .not.to.throw();
    },
  );


  it('should validate address format', async () => {
    const sdk = await createSdk(admin);
    const chainId = await admin.getChainId();
    const correctAddresses = [
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      new caip.AccountId({
        chainId: 'eip155:' + chainId,
        address: '0x8ba1f109551bd432803012645ac136ddd64dba72',
      }),
    ];
    const incorrectAddresses = [
      '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', // checksum is wrong
      '12345678910',
      new caip.AccountId({
        chainId: 'eip155:' + chainId,
        address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
      }),
    ];
    for (const x of correctAddresses) {
      expect(() => sdk.createAccessControl(x)).not.to.throw();
    }
    for (const x of incorrectAddresses) {
      expect(() => sdk.createAccessControl(x)).to.throw();
    }
  });


});
