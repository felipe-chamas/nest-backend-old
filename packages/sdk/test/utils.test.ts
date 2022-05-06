import {
  expect,
  runDeployTask,
} from './utils';

import {
  createSdk,
  constants,
  GameToken,
  Utils,
  GeneralError,
  ErrorCodes,
  AccessControl,
  Roles,
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

  describe('fetchEvents by transactionHash', () => {

    let aclAddress: string;
    let gameTokenAddress: string;
    let anon: SignerWithAddress;
    let gameTokenService: GameToken;
    let aclService: AccessControl;
    let utils: Utils;

    async function prepare() {
      // create GameToken service
      [anon] = await hre.ethers.getSigners();
      aclAddress = await runDeployTask(
        'acl',
        { admin: admin.address, operator: anon.address },
      );
      gameTokenAddress = await runDeployTask(
        'game-token',
        {
          admin: admin.address,
          name: 'Test',
          symbol: 'test',
          supply: '10000',
          acl: aclAddress,
        },
      );
      const sdk = await createSdk(admin);
      gameTokenService = await sdk.createGameToken(gameTokenAddress);
      aclService = sdk.createAccessControl(aclAddress);
      utils = sdk.utils;
    }

    beforeEach('configure before fetch event testcase', prepare);

    it('should be fullfilled with expected return type', async () => {
      // call game token transfer method x2 times
      const transferAmount = 123;
      const transaction = await gameTokenService
        .transfer(anon.address, transferAmount);
      await expect(transaction.wait()).to.eventually.fulfilled;

      await expect((
        await gameTokenService.transfer(anon.address, transferAmount)
      ).wait())
        .to.eventually.fulfilled;

      // fetch Transfer events by transaction hash
      const events = await utils.fetchEvents(
        transaction.hash,
        gameTokenAddress,
        'GameToken',
        'Transfer',
      );
      // check that only single transfer event was returned
      expect(events).to.have.lengthOf(1);
      // check event properties
      const event = events[0];
      expect(event.to.address).to.equal(anon.address);
      expect(event.from.address).to.equal(admin.address);
      expect(event.value.toNumber()).to.equal(transferAmount);
    });

    it('should return empty array if no matching events occured', async () => {
      const transaction = await gameTokenService.transfer(anon.address, 213);
      await expect(transaction.wait()).to.eventually.fulfilled;
      const events = await utils.fetchEvents(
        transaction.hash,
        gameTokenAddress,
        'ACL',
        'RoleGranted',
      );
      expect(events).to.have.length(0);
    });

    it('should fail if event/contract is not supported', async () => {
      const transaction = await gameTokenService.transfer(anon.address, 213);
      await expect(transaction.wait()).to.eventually.fulfilled;
      await expect(utils.fetchEvents(
        transaction.hash,
        gameTokenAddress,
        'NotExistedContract' as 'ACL', // ask for non existing contract
        'RoleRevoked',
      ))
        .to.eventually.rejectedWith(GeneralError)
        .to.have.property('errorCode', ErrorCodes.not_supported_event);
      await expect(utils.fetchEvents(
        transaction.hash,
        gameTokenAddress,
        'GameToken',
        'RoundAdded' as 'Transfer', // send wrong event
      ))
        .to.eventually.rejectedWith(GeneralError)
        .to.have.property('errorCode', ErrorCodes.not_supported_event);
    });

    it('should transform role hash to Role type', async () => {
      const transaction = await aclService.grantRole(
        anon.address, Roles.Minter,
      );
      await expect(transaction.wait()).to.eventually.fulfilled;
      const events = await utils.fetchEvents(
        transaction.hash,
        aclAddress,
        'ACL',
        'RoleGranted',
      );
      const event = events[0];
      expect(event.role).to.equal(Roles.Minter);
    });

  });

});
