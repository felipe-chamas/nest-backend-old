import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { GameToken } from '../../../typechain';
import { ONE_TOKEN } from '../../shared/constants';

export function shouldBehaveLikeGameToken() {
  context('Game Token', function () {
    let OPERATOR_ROLE: string;
    let token: GameToken;
    let stranger: SignerWithAddress;
    let admin: SignerWithAddress;
    let other: SignerWithAddress;

    beforeEach(function () {
      ({ OPERATOR_ROLE } = this.roles);
      ({ admin, other, stranger } = this.signers);
      token = this.contracts.gameToken;
    });

    describe('Basic', function () {
      it('has name', async function () {
        await expect(token.name()).to.eventually.not.be.null;
      });

      it('has symbol', async function () {
        await expect(token.symbol()).to.eventually.not.be.null;
      });

      it('has decimals', async function () {
        await expect(token.decimals()).to.eventually.eq(18);
      });
    });

    describe('when unpaused', function () {
      it('should not allow stranger to pause', async function () {
        await expect(token.connect(stranger).pause()).to.be.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`,
        );
      });

      it('should allow admin to pause', async function () {
        await token.pause();

        await expect(token.paused()).eventually.to.be.true;
      });
    });

    describe('when paused', function () {
      beforeEach(async function () {
        await token.pause();
      });

      it('should fail to transfer tokens', async function () {
        await expect(token.transfer(other.address, ONE_TOKEN)).to.be.revertedWith('Pausable: paused');
      });

      it('should allow to approve tokens', async function () {
        await token.approve(other.address, ONE_TOKEN);

        await expect(token.allowance(admin.address, other.address)).to.eventually.eq(ONE_TOKEN);
      });

      it('should fail to transfer approved tokens', async function () {
        await token.approve(other.address, ONE_TOKEN);

        await expect(token.connect(other).transferFrom(admin.address, other.address, ONE_TOKEN)).to.be.revertedWith(
          'Pausable: paused',
        );
      });
    });
  });
}
