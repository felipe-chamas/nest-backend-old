import {
  createSdk, GeneralError, Address,
  AccessControl, Role, ErrorCodes, Roles,
} from '../';

import { expect, runDeployTask } from './utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as hre from 'hardhat';

describe('tests of access-control service', () => {

  let admin: SignerWithAddress;
  let operator: SignerWithAddress;
  let aclAddress: Address;

  let aclServiceAsAdmin: AccessControl;
  let aclServiceAsOperator: AccessControl;


  beforeEach('configure contracts', async () => {
    [admin, operator] = await hre.ethers.getSigners();
    aclAddress = await runDeployTask(
      'acl',
      { admin: admin.address, operator: operator.address },
    );
    const sdkAsAdmin = await createSdk(admin);
    aclServiceAsAdmin = sdkAsAdmin.createAccessControl(aclAddress);
    const sdkAsOperator = await createSdk(operator);
    aclServiceAsOperator = sdkAsOperator.createAccessControl(aclAddress);
  });


  it('should be initialized', async () => {
    const sdk = await createSdk(admin);
    expect(() => sdk.createAccessControl(aclAddress))
      .to.not.throw();
  });


  it('should grand role', async () => {
    const [signer1] = await hre.ethers.getSigners();
    const transaction = await aclServiceAsAdmin
      .grantRole(signer1.address, Roles.Operator);
    await expect(transaction.wait()).to.eventually.be.fulfilled;
    const operators = await aclServiceAsAdmin.listByRole(Roles.Operator);
    expect(operators).to.be.ofSize(2);
  });


  it('should check if role exists', async () => {
    const [signer1] = await hre.ethers.getSigners();
    const unknownRole = 'no';
    await expect(aclServiceAsAdmin
      .grantRole(signer1.address, unknownRole as Role))
      .to.eventually.be.rejectedWith(GeneralError, unknownRole)
      .with.property('errorCode', ErrorCodes.role_not_exist);
  });


  it('should revoke role', async () => {
    const transaction = await aclServiceAsAdmin
      .revokeRole(operator.address, Roles.Operator);
    await expect(transaction.wait()).to.eventually.be.fulfilled;
    await expect(aclServiceAsAdmin.listByRole(Roles.Operator))
      .to.eventually.have.lengthOf(0);
  });


  describe('renounce', () => {
    it('should renonce role', async () => {
      const transaction = await aclServiceAsOperator
        .renounceRole(operator.address, Roles.Operator);
      expect(transaction.wait()).to.eventually.be.fulfilled;
      expect(aclServiceAsOperator.listByRole(Roles.Operator))
        .to.eventually.equal(0);
    });

    it('should validate signer against address to renounce', async () => {
      await expect(
        aclServiceAsAdmin.renounceRole(operator.address, Roles.Operator),
      )
        .to.eventually.be.rejectedWith(GeneralError, '')
        .with.property('errorCode', ErrorCodes.renounce_only_self);
    });
  });


  it('should check if address has a role', async () => {
    await expect(aclServiceAsAdmin.hasRole(admin.address, Roles.Owner))
      .to.eventually.equal(false);
    await expect(aclServiceAsAdmin.hasRole(operator.address, Roles.Operator))
      .to.eventually.equal(true);
  });


  describe('list by role', () => {
    it('should return null if role is empty', async () => {
      await expect(aclServiceAsAdmin.getNthRoleMember(Roles.Admin, 10))
        .to.eventually.be.null;
      await expect(aclServiceAsAdmin.getNthRoleMember(Roles.Admin, 0))
        .to.eventually.fulfilled
        .with.property('address', admin.address);
    });

    it('should make list operations with role members', async () => {
      let reply = await aclServiceAsAdmin.grantRole(admin.address, Roles.Owner);
      await expect(reply.wait()).to.eventually.fulfilled;
      reply = await aclServiceAsAdmin.grantRole(operator.address, Roles.Owner);
      await expect(reply.wait()).to.eventually.fulfilled;
      const owners = await aclServiceAsOperator.listByRole(Roles.Owner);
      const ownersAddresses = owners.map(x => x.address);
      expect(ownersAddresses)
        .to.have.length(2)
        .to.include(admin.address)
        .to.include(operator.address);
    });
  });


});
