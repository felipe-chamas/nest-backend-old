import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ERC20Mock, ERC20TokenRecoverable } from '../../../typechain';
import { ONE_TOKEN } from '../../shared/constants';
import { Roles } from '../../shared/types';

export function shouldBehaveLikeERC20TokenRecoverable() {
  context('token recovery', function () {
    let recoverable: ERC20TokenRecoverable;
    let mockToken: ERC20Mock;
    let other: SignerWithAddress;
    let stranger: SignerWithAddress;

    beforeEach(async function () {
      ({ recoverable, mockToken } = this.contracts);
      ({ other, stranger } = this.signers);
      await mockToken.transfer(recoverable.address, ONE_TOKEN);
    });

    it('should be able to recover tokens', async function () {
      await recoverable.recover(mockToken.address, other.address, ONE_TOKEN);

      await expect(mockToken.balanceOf(other.address)).to.eventually.eq(ONE_TOKEN);
    });

    it('should not allow stranger to recover tokens', async function () {
      await expect(
        recoverable.connect(stranger).recover(mockToken.address, other.address, ONE_TOKEN),
      ).to.be.rejectedWith(
        `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.ADMIN_ROLE}`,
      );
    });
  });
}
