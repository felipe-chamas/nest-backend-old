import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { ERC20Mock, Splitter } from '../../../typechain';
import { ONE_TOKEN } from '../../shared/constants';

export function shouldBehaveLikeSplitter() {
  context('Splitter', function () {
    let splitter: Splitter;
    let operator: SignerWithAddress;
    let other: SignerWithAddress;
    let stranger: SignerWithAddress;
    let mockToken: ERC20Mock;

    beforeEach(async function () {
      ({ splitter, mockToken } = this.contracts);
      ({ operator, other, stranger } = this.signers);
      await Promise.all([
        mockToken.transfer(operator.address, ONE_TOKEN),
        mockToken.transfer(other.address, ONE_TOKEN),
        mockToken.transfer(stranger.address, ONE_TOKEN),
      ]);
    });

    context('when operator', function () {
      it('stranger should be able to send', async function () {
        const one = ethers.utils.parseEther('0.1');
        const two = ethers.utils.parseEther('0.2');
        const total = one.add(two);

        const [operatorBefore, otherBefore, strangerBefore] = await Promise.all([
          mockToken.balanceOf(operator.address),
          mockToken.balanceOf(other.address),
          mockToken.balanceOf(stranger.address),
        ]);

        await expect(mockToken.connect(stranger).approve(splitter.address, total.toString())).to.not.be.reverted;

        await expect(
          splitter.connect(stranger).send(mockToken.address, [
            { account: operator.address, amount: ethers.utils.parseEther('0.1').toString() },
            { account: other.address, amount: ethers.utils.parseEther('0.2').toString() },
          ]),
        ).to.not.be.reverted;

        const [operatorAfter, otherAfter, strangerAfter] = await Promise.all([
          mockToken.balanceOf(operator.address),
          mockToken.balanceOf(other.address),
          mockToken.balanceOf(stranger.address),
        ]);
        expect(operatorAfter).to.equal(operatorBefore.add(one));
        expect(otherAfter).to.equal(otherBefore.add(two));
        expect(strangerAfter).to.equal(strangerBefore.sub(total));
      });

      it('should revert with invalid address', async function () {
        await expect(
          mockToken.connect(stranger).approve(splitter.address, ethers.utils.parseEther('0.3').toString()),
        ).to.not.be.reverted;

        await expect(
          splitter.connect(stranger).send(mockToken.address, [
            { account: operator.address, amount: ethers.utils.parseEther('0.1').toString() },
            { account: ethers.constants.AddressZero, amount: ethers.utils.parseEther('0.2').toString() },
          ]),
        ).to.be.rejectedWith('InvalidPayeeAddress()');
      });
    });
  });
}
