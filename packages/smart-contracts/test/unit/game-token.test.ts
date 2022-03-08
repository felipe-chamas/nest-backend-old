import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';
import { GameToken, GameToken__factory } from '../../typechain';

async function gameTokenFixture(): Promise<GameToken> {
  const [deployer] = await ethers.getSigners();
  const address = await hre.run('deploy:game-token', {
    admin: deployer.address,
    name: 'Test',
    symbol: 'TST',
    supply: ethers.utils.parseEther('100000').toString(),
  });

  return GameToken__factory.connect(address, deployer);
}

export function unitTestGameToken(): void {
  const ONE_TOKEN = 10n ** 18n;
  describe('Game Token', function () {
    let token: GameToken;
    let admin: SignerWithAddress;
    let other: SignerWithAddress;
    let stranger: SignerWithAddress;

    beforeEach(async function () {
      [admin, other, stranger] = this.signers;

      token = await this.loadFixture(gameTokenFixture);
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

    describe('when unpaused', () => {
      it('should not allow stranger to pause', async () => {
        await expect(token.connect(stranger).pause()).to.be.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role 0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a`,
        );
      });

      it('should allow admin to pause', async () => {
        await token.pause();

        await expect(token.paused()).to.eventually.be.true;
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

      it('should fail to transfer approved tokens', async () => {
        await token.approve(other.address, ONE_TOKEN);

        await expect(token.connect(other).transferFrom(admin.address, other.address, ONE_TOKEN)).to.be.revertedWith(
          'Pausable: paused',
        );
      });
    });

    describe('token recovery', () => {
      beforeEach(async () => {});
    });
  });
}
