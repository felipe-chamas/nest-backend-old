import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { AccessControllable, ACL } from '../../../typechain';
import { AddressZero } from '../../shared/constants';

export function shouldBehaveLikeAccessControllable() {
  context('access controllable', function () {
    let accessControllable: AccessControllable;
    let acl: ACL;
    let user: SignerWithAddress;
    let OWNER_ROLE: string;

    beforeEach(function () {
      ({ accessControllable, acl } = this.contracts);
      ({ user } = this.signers);
      ({ OWNER_ROLE } = this.roles);
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
        await acl.grantRole(OWNER_ROLE, user.address);
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
