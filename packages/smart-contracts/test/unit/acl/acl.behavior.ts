import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ACL } from '../../../typechain';
import { Roles } from '../../shared/types';

export function shouldBehaveLikeACL() {
  context('ACL', function () {
    let acl: ACL;
    let admin: SignerWithAddress;
    let operator: SignerWithAddress;
    let stranger: SignerWithAddress;

    beforeEach(function () {
      ({ acl } = this.contracts);
      ({ admin, operator, stranger } = this.signers);
    });

    context('when admin', function () {
      it('admin should pass check', async function () {
        await expect(acl.checkRole(Roles.ADMIN_ROLE, admin.address)).to.not.be.reverted;
      });

      it('stranger should not pass admin check', async function () {
        await expect(acl.checkRole(Roles.ADMIN_ROLE, stranger.address)).to.be.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.ADMIN_ROLE}`,
        );
      });

      context('tries to remove last account from ADMIN role', () => {
        it('reverts', async () => {
          await expect(acl.revokeRole(Roles.ADMIN_ROLE, admin.address)).to.be.revertedWith('CannotRemoveLastAdmin()');
        });
      });

      context('tries to renounce role, being the last admin', () => {
        it('reverts', async () => {
          await expect(acl.renounceRole(Roles.ADMIN_ROLE, admin.address)).to.be.revertedWith('CannotRemoveLastAdmin()');
        });
      });
    });

    context('when operator', function () {
      it('operator should pass check', async function () {
        await expect(acl.checkRole(Roles.OPERATOR_ROLE, operator.address)).to.not.be.reverted;
      });

      it('stranger should not pass operator check', async function () {
        await expect(acl.checkRole(Roles.OPERATOR_ROLE, stranger.address)).to.be.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.OPERATOR_ROLE}`,
        );
      });

      context('tries to renounce role, being the last operator', () => {
        it('succeeds', async () => {
          await acl.connect(operator).renounceRole(Roles.OPERATOR_ROLE, operator.address);

          await expect(acl.hasRole(Roles.OPERATOR_ROLE, operator.address)).eventually.to.be.false;
        });
      });
    });

    context('when owner', function () {
      beforeEach(async () => {
        await acl.grantRole(Roles.OWNER_ROLE, admin.address);
      });

      it('admin should pass owner check', async function () {
        await expect(acl.checkRole(Roles.OWNER_ROLE, admin.address)).to.not.be.reverted;
      });

      it('stranger should not pass operator check', async function () {
        await expect(acl.checkRole(Roles.OWNER_ROLE, stranger.address)).to.be.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.OWNER_ROLE}`,
        );
      });
    });
  });
}
