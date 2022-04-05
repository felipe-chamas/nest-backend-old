import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ACL } from '../../../typechain';

export function shouldBehaveLikeACL() {
  context('ACL', function () {
    let OPERATOR_ROLE: string;
    let ADMIN_ROLE: string;
    let OWNER_ROLE: string;
    let acl: ACL;
    let admin: SignerWithAddress;
    let operator: SignerWithAddress;
    let stranger: SignerWithAddress;

    beforeEach(function () {
      ({ acl } = this.contracts);
      ({ ADMIN_ROLE, OPERATOR_ROLE, OWNER_ROLE } = this.roles);
      ({ admin, operator, stranger } = this.signers);
    });

    describe('when admin', function () {
      it('admin should pass check', async function () {
        await expect(acl.checkRole(ADMIN_ROLE, admin.address)).to.not.be.reverted;
      });

      it('stranger should not pass admin check', async function () {
        await expect(acl.checkRole(ADMIN_ROLE, stranger.address)).to.be.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });
    });

    describe('when operator', function () {
      it('operator should pass check', async function () {
        await expect(acl.checkRole(OPERATOR_ROLE, operator.address)).to.not.be.reverted;
      });

      it('stranger should not pass operator check', async function () {
        await expect(acl.checkRole(OPERATOR_ROLE, stranger.address)).to.be.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`,
        );
      });
    });

    describe('when owner', function () {
      beforeEach(async () => {
        await acl.grantRole(OWNER_ROLE, admin.address);
      });

      it('admin should pass owner check', async function () {
        await expect(acl.checkRole(OWNER_ROLE, admin.address)).to.not.be.reverted;
      });

      it('stranger should not pass operator check', async function () {
        await expect(acl.checkRole(OWNER_ROLE, stranger.address)).to.be.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${OWNER_ROLE}`,
        );
      });
    });
  });
}
