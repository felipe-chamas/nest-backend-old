import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { AccessControllable, ACL } from '../../../typechain';
import { AddressZero } from '../../shared/constants';
import { Roles } from '../../shared/types';

export function shouldBehaveLikeAccessControllable() {
  context('access controllable', function () {
    let accessControllable: AccessControllable;
    let acl: ACL;
    let user: SignerWithAddress;

    beforeEach(function () {
      ({ accessControllable, acl } = this.contracts);
      ({ user } = this.signers);
    });

    context('when ROLE_OWNER is not set', () => {
      context('when calling owner() function', () => {
        it('returns zero address', async () => {
          await expect(accessControllable.owner()).eventually.to.eq(AddressZero);
        });
      });

      context('when calling getOwner() function', () => {
        it('returns zero address', async () => {
          await expect(accessControllable.getOwner()).eventually.to.eq(AddressZero);
        });
      });
    });

    context('when user is granted owner roles', () => {
      beforeEach(async () => {
        await acl.grantRole(Roles.OWNER_ROLE, user.address);
      });

      context('when calling owner() function', () => {
        it('returns user address', async () => {
          await expect(accessControllable.owner()).eventually.to.eq(user.address);
        });
      });

      context('when calling getOwner() function', () => {
        it('returns user address', async () => {
          await expect(accessControllable.getOwner()).eventually.to.eq(user.address);
        });
      });
    });
  });
}
