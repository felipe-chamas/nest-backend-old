import {
  createSdk,
  Address,
  GameToken,
  typechain,
} from '../';

import {
  runDeployTask,
  expect,
} from './utils';
import * as hre from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';


describe('game-token functionality', () => {

  const gameTokenName = 'Game Token';
  const gameTokenSymbol = 'gt';
  const gameTokenSupply = 123345;

  let admin: SignerWithAddress;
  let operator: SignerWithAddress;
  let anon: SignerWithAddress;
  let aclAddress: Address;
  let gameTokenAddress: Address;
  let gameTokenServiceAsAdmin: GameToken;
  let gameTokenServiceAsOperator: GameToken;
  let gameTokenServiceAsAnon: GameToken;
  let gameTokenContractAsAdmin: typechain.GameToken;

  async function configure() {
    [admin, operator, anon] = await hre.ethers.getSigners();
    aclAddress = await runDeployTask(
      'acl',
      { admin: admin.address, operator: operator.address },
    );
    gameTokenAddress = await runDeployTask(
      'game-token',
      {
        admin: admin.address,
        name: gameTokenName,
        symbol: gameTokenSymbol,
        supply: gameTokenSupply,
        acl: aclAddress,
      },
    );
    const sdkAsAdmin = await createSdk(admin);
    const sdkAsOperator = await createSdk(operator);
    const sdkAsAnon = await createSdk(anon);
    const utils = sdkAsAdmin.utils;
    gameTokenServiceAsAdmin = await sdkAsAdmin.createGameToken(
      utils.createAccountIdFromAddress(gameTokenAddress),
    );
    gameTokenServiceAsOperator = await sdkAsOperator.createGameToken(
      utils.createAccountIdFromAddress(gameTokenAddress),
    );
    gameTokenServiceAsAnon = await sdkAsAnon.createGameToken(
      utils.createAccountIdFromAddress(gameTokenAddress),
    );
    gameTokenContractAsAdmin = typechain.GameToken__factory.connect(
      gameTokenAddress,
      admin,
    );
  }

  beforeEach('configure contracts', configure);

  it('check setup', async () => {
    const sdk = await createSdk(admin);
    const gameToken = sdk.createGameToken(gameTokenAddress);
    expect(sdk).to.exist;
    expect(gameToken).to.exist;
  });

  it('off-chain permits', async () => {
    // create permit from admin to allow anon to spend admin's tokens
    const allowAmount = 156;
    const permit = await gameTokenServiceAsAdmin.createAllowancePermit(
      anon.address,
      allowAmount,
      Math.round(Date.now()/1000) + 60*60, // +1 hour
    );
    // submit permit by operator
    const transaction = await gameTokenServiceAsOperator
      .submitAllowancePermit(permit);
    await expect(transaction.wait()).to.eventually.fulfilled;
    // check anon allowance
    const allowanceReply = await gameTokenServiceAsAnon
      .getAllowance(admin.address, anon.address);
    expect(allowanceReply.toNumber()).to.equal(allowAmount);
  });
  it('off-chain permits', async () => {
    // create permit from admin to allow anon to spend admin's tokens
    const allowAmount = 156;
    const permit = await gameTokenServiceAsAdmin.createAllowancePermit(
      anon.address,
      allowAmount,
      Math.round(Date.now()/1000) + 60*60, // +1 hour
    );
    // submit permit by operator
    const transaction = await gameTokenServiceAsOperator
      .submitAllowancePermit(permit);
    await expect(transaction.wait()).to.eventually.fulfilled;
    // check anon allowance
    const allowanceReply = await gameTokenServiceAsAnon
      .getAllowance(admin.address, anon.address);
    expect(allowanceReply.toNumber()).to.equal(allowAmount);
  });

  describe('transfer tokens', () => {

    it('should get balance', async () => {
      let reply = await gameTokenServiceAsAdmin.getBalanceOf(admin.address);
      const getBalanceOfAdmin = reply.toNumber();
      expect(getBalanceOfAdmin).to.equal(gameTokenSupply);
      reply = await gameTokenServiceAsAdmin.getBalanceOf(operator.address);
      expect(reply.toNumber()).to.equal(0);
    });

    it('should transfer token from signer to addres', async () => {
      const amountToTransfer = 123;
      const reply = await gameTokenServiceAsAdmin.transfer(
        operator.address,
        amountToTransfer,
      );
      await expect(reply.wait()).to.eventually.fulfilled;
      const adminBalance = await gameTokenServiceAsAdmin
        .getBalanceOf(admin.address);
      const operatorBalance = await gameTokenServiceAsAdmin
        .getBalanceOf(operator.address);
      expect(adminBalance.toNumber())
        .to.equal(gameTokenSupply - amountToTransfer);
      expect(operatorBalance.toNumber())
        .to.equal(amountToTransfer);

    });

    it('should transfer allowed tokens', async () => {
      let approvedAmount = 124;
      // allow anon to use tokens
      let transaction = await gameTokenServiceAsAdmin
        .approve(anon.address, approvedAmount);
      await expect(transaction.wait()).to.eventually.fulfilled;
      // send from admin to operator by anon
      const amountToSend = 65;
      transaction = await gameTokenServiceAsAnon
        .transferFrom(admin.address, operator.address, amountToSend);
      await expect(transaction.wait()).to.eventually.fulfilled;
      // check operator balance
      let balanceReply = await gameTokenServiceAsAnon
        .getBalanceOf(operator.address);
      expect(balanceReply.toNumber()).to.equal(amountToSend);
      // check left allowance of anon to spend admin's tokens
      approvedAmount = approvedAmount - amountToSend;
      const allowanceReply = await gameTokenServiceAsAnon
        .getAllowance(admin.address, anon.address);
      expect(allowanceReply.toNumber()).to.equal(approvedAmount);
      // check balane of admin
      const balanceLeft = gameTokenSupply - amountToSend;
      balanceReply = await gameTokenServiceAsAnon
        .getBalanceOf(admin.address);
      expect(balanceReply.toNumber()).to.equal(balanceLeft);
    });

  });

  it('allowance managment', async () => {
    let approvedAmount = 10;
    let allowanceReply = await gameTokenServiceAsAnon
      .getAllowance(admin.address, anon.address);
    expect(allowanceReply.toNumber()).to.equal(0);

    let transaction = await gameTokenServiceAsAdmin
      .approve(anon.address, approvedAmount);
    await expect(transaction.wait()).to.eventually.fulfilled;

    allowanceReply = await gameTokenServiceAsAnon
      .getAllowance(admin.address, anon.address);
    expect(allowanceReply.toNumber()).to.equal(approvedAmount);

    const increasedByAmount = 5;
    transaction = await gameTokenServiceAsAdmin
      .increaseAllowance(anon.address, increasedByAmount);
    await expect(transaction.wait()).to.eventually.fulfilled;

    let expectedAllowance = increasedByAmount + approvedAmount;
    allowanceReply = await gameTokenServiceAsAnon
      .getAllowance(admin.address, anon.address);
    expect(allowanceReply.toNumber()).to.equal(expectedAllowance);

    const decreaseByAmount = 8;
    transaction = await gameTokenServiceAsAdmin
      .decreaseAllowance(anon.address, decreaseByAmount);
    await expect(transaction.wait()).to.eventually.fulfilled;

    expectedAllowance = expectedAllowance - decreaseByAmount;
    allowanceReply = await gameTokenServiceAsAnon
      .getAllowance(admin.address, anon.address);
    expect(allowanceReply.toNumber()).to.equal(expectedAllowance);

    approvedAmount = 23;
    transaction = await gameTokenServiceAsAdmin
      .approve(anon.address, approvedAmount);
    await expect(transaction.wait()).to.eventually.fulfilled;

    allowanceReply = await gameTokenServiceAsAnon
      .getAllowance(admin.address, anon.address);
    expect(allowanceReply.toNumber()).to.equal(approvedAmount);
  });


  describe('burn token', () => {

    it('should burn owned tokens', async () => {
      const initialAmount = 400;
      const amountToBurn = 123;
      const transferReply = await gameTokenServiceAsAdmin
        .transfer(anon.address, initialAmount);
      await expect(transferReply.wait())
        .to.eventually.fulfilled;
      const balance = await gameTokenServiceAsAnon.getBalanceOf(anon.address);
      expect(balance.toNumber()).to.equal(initialAmount);
      const burnReply = await gameTokenServiceAsAnon.burnToken(amountToBurn);
      await expect(burnReply.wait())
        .to.eventually.fulfilled;
      const balanceAfterBurn = await gameTokenServiceAsAnon
        .getBalanceOf(anon.address);
      expect(balanceAfterBurn.toNumber())
        .to.equal(initialAmount - amountToBurn);
    });

    it("should burn other's tokens", async () => {
      const approvedAmount = 123;

      let transaction = await gameTokenServiceAsAdmin
        .approve(anon.address, approvedAmount);
      await expect(transaction.wait()).to.eventually.fulfilled;

      let allowanceReply = await gameTokenServiceAsAnon
        .getAllowance(admin.address, anon.address);
      expect(allowanceReply.toNumber()).to.equal(approvedAmount);


      await expect(gameTokenServiceAsAnon.burnTokenFrom(admin.address, 10000))
        .to.eventually.rejectedWith(Error, 'insufficient allowance');

      const amountToBurn = 53;
      transaction = await gameTokenServiceAsAnon
        .burnTokenFrom(admin.address, amountToBurn);
      await expect(transaction.wait()).to.eventually.fulfilled;

      const expectedAllowance = approvedAmount - amountToBurn;
      allowanceReply = await gameTokenServiceAsAnon
        .getAllowance(admin.address, anon.address);
      expect(allowanceReply.toNumber()).to.equal(expectedAllowance);

      const expectedBalance = gameTokenSupply - amountToBurn;
      const balanceReply = await gameTokenServiceAsAnon
        .getBalanceOf(admin.address);
      expect(balanceReply.toNumber()).to.equal(expectedBalance);

    });

  });


  describe('basic info', () => {
    it('should fetch basic info', async () => {
      // fetch meta info
      const metaInfo = gameTokenServiceAsAdmin.tokenMetaInfo;
      // check all values of it
      expect(metaInfo.symbol).to.equal(gameTokenSymbol);
      expect(metaInfo.name).to.equal(gameTokenName);
      expect(metaInfo.totalSupply.toNumber()).to.equal(gameTokenSupply);
      expect(metaInfo.decimals)
        .to.equal(await gameTokenContractAsAdmin.decimals());
    });
  });

  it('pausing of contract', async () => {
    const anonSdk = await createSdk(anon);
    const adminSdk = await createSdk(admin);
    const adminAcl = adminSdk.createAccessControl(aclAddress);
    const anonGameToken = await anonSdk.createGameToken(gameTokenAddress);

    await expect(anonGameToken.isTokenPaused())
      .to.eventually.equal(false);

    await expect(anonGameToken.pauseToken())
      .to.eventually.rejectedWith(Error, ' is missing role ');

    const grantRoleReply = await adminAcl
      .grantRole(anon.address, 'Operator');
    await expect(grantRoleReply.wait()).to.eventually.fulfilled;

    const pauseReply = await anonGameToken.pauseToken();
    await expect(pauseReply.wait()).to.eventually.fulfilled;

    await expect(anonGameToken.isTokenPaused())
      .to.eventually.equal(true);

    const unpauseReply = await anonGameToken.unpauseToken();
    await expect(unpauseReply.wait()).to.eventually.fulfilled;

    await expect(anonGameToken.isTokenPaused())
      .to.eventually.equal(false);

  });


  it('should recover tokens sent by mistake', async () => {
    // admin sends gameTokens to anon
    const amountToTransfer = 43;
    let transaction = await gameTokenServiceAsAdmin
      .transfer(anon.address, amountToTransfer);
    await expect(transaction.wait()).to.eventually.fulfilled;
    // anon sends gameTokens to GameToken contract
    const amountToRecover = 4;
    transaction = await gameTokenServiceAsAnon
      .transfer(gameTokenAddress, amountToRecover);
    await expect(transaction.wait()).to.eventually.fulfilled;
    // check anon's balane
    let balanceReply = await gameTokenServiceAsAnon
      .getBalanceOf(anon.address);
    expect(balanceReply.toNumber())
      .to.equal(amountToTransfer - amountToRecover);
    // check contract balance
    balanceReply = await gameTokenServiceAsAnon
      .getBalanceOf(gameTokenAddress);
    expect(balanceReply.toNumber())
      .to.equal(amountToRecover);
    // try to recover sent tokens
    const recoverReply = await gameTokenServiceAsAdmin.recover(
      gameTokenAddress,
      anon.address,
      amountToRecover,
    );
    await expect(recoverReply.wait())
      .to.eventually.fulfilled;
    // check anon's balance
    balanceReply = await gameTokenServiceAsAnon
      .getBalanceOf(anon.address);
    expect(balanceReply.toNumber()).to.equal(amountToTransfer);
  });

});
