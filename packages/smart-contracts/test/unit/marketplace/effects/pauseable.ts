import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { MarketplaceMock } from '../../../../typechain';
import { Roles } from '../../../shared/types';

export function shouldBehaveLikeMarketplacePauseable() {
  let marketplace: MarketplaceMock;
  let admin: SignerWithAddress;
  let operator: SignerWithAddress;
  let stranger: SignerWithAddress;

  beforeEach(function () {
    ({ admin, operator, stranger } = this.signers);
    ({ marketplace } = this.contracts);
  });

  context('when operator', () => {
    context('pause()', () => {
      context('calls pause()', () => {
        it('works', async () => {
          await marketplace.connect(operator).pause();

          await expect(marketplace.paused()).eventually.is.true;
        });
      });

      context('calls pause() twice', () => {
        it('reverts', async () => {
          await marketplace.connect(operator).pause();

          await expect(marketplace.connect(operator).pause()).to.be.rejectedWith('Pausable: paused');
        });
      });
    });
  });

  context('when admin', () => {
    context('calls unpause()', () => {
      context('when contract is not paused', () => {
        it('reverts', async () => {
          await expect(marketplace.connect(admin).unpause()).to.be.rejectedWith('Pausable: not paused');
        });
      });

      context('when contract is paused', () => {
        beforeEach(async () => {
          await marketplace.connect(operator).pause();
        });
        it('works', async () => {
          await marketplace.connect(admin).unpause();

          await expect(marketplace.paused()).eventually.to.be.false;
        });
      });
    });
  });

  context('when stranger', () => {
    context('calls pause()', () => {
      it('reverts', async () => {
        await expect(marketplace.connect(stranger).pause()).to.be.rejectedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.OPERATOR_ROLE}`,
        );
      });
    });

    context('calls unpause()', () => {
      beforeEach(async () => {
        await marketplace.connect(operator).pause();
      });

      it('reverts', async () => {
        await expect(marketplace.connect(stranger).unpause()).to.be.rejectedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.ADMIN_ROLE}`,
        );
      });
    });
  });
}
