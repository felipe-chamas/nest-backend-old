import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { TokenSale } from '../../../../typechain';
import { Roles } from '../../../shared/types';
import { currentTime } from '../../../shared/utils';

export function shouldBehaveLikeVesting() {
  let operator: SignerWithAddress;
  let stranger: SignerWithAddress;
  let tokenSale: TokenSale;
  let now: number;
  beforeEach(async function () {
    ({ operator, stranger } = this.signers);
    ({ tokenSale } = this.contracts);

    now = await currentTime();
  });

  context('vesting start', () => {
    context('when called by operator', () => {
      it('starts vesting', async () => {
        const vestingStart = now + 100;

        await expect(tokenSale.connect(operator).setVestingStart(vestingStart))
          .to.emit(tokenSale, 'VestingStartChanged')
          .withArgs(vestingStart);
        await expect(tokenSale.getVestingStart()).eventually.to.eq(vestingStart);
      });

      it('fails to start vesting in past', async () => {
        await expect(tokenSale.connect(operator).setVestingStart(now - 1)).to.be.revertedWith(
          'VestingStartMustBeInFuture()',
        );
      });

      it('fails to start vesting twice', async () => {
        await tokenSale.connect(operator).setVestingStart(now + 100);

        await expect(tokenSale.connect(operator).setVestingStart(now + 200)).to.be.revertedWith(
          `VestingAlreadyStarted(${now + 100})`,
        );
      });
    });

    context('when called by stranger', () => {
      it('reverts', async () => {
        await expect(tokenSale.connect(stranger).setVestingStart(now + 10)).to.be.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.OPERATOR_ROLE}`,
        );
      });
    });
  });
}
