import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';
import { GameToken, GameToken__factory } from '../../typechain';

export function shouldBehaveLikeGameToken(): void {
  const ONE_TOKEN = 10n ** 18n;
  describe('Game Token', function () {
    let token: GameToken;
    let admin: SignerWithAddress;
    let other: SignerWithAddress;
    let stranger: SignerWithAddress;

    beforeEach(async function () {
      [admin, other, stranger] = this.signers;

      const address = await hre.run('deploy:game-token', {
        admin: admin.address,
        name: 'Test',
        symbol: 'TST',
        supply: ethers.utils.parseEther('100000').toString(),
      });

      token = GameToken__factory.connect(address, admin);
    });

    describe('Basic', () => {
      it('has name', async () => {
        await expect(token.name()).to.eventually.not.be.null;
      });

      it('has symbol', async () => {
        await expect(token.symbol()).to.eventually.not.be.null;
      });

      it('has decimals', async () => {
        await expect(token.decimals()).to.eventually.eq(18);
      });
    });

    describe('when paused', () => {
      beforeEach(async () => {
        await token.pause();
      });

      it('should fail to transfer tokens', async () => {
        await expect(token.transfer(other.address, ONE_TOKEN)).to.be.revertedWith('Pausable: paused');
      });

      it('should allow to approve tokens', async () => {
        await token.approve(other.address, ONE_TOKEN);

        await expect(token.allowance(admin.address, other.address)).to.eventually.eq(ONE_TOKEN);
      });
    });
  });
}
