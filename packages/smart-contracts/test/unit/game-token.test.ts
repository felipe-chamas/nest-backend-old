import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';
import { ERC20Mock, ERC20Mock__factory, GameToken, GameToken__factory } from '../../typechain';

async function gameTokenFixture(): Promise<{ token: GameToken; mockToken: ERC20Mock }> {
  const [deployer] = await ethers.getSigners();
  const gameTokenAddress = await hre.run('deploy:game-token', {
    admin: deployer.address,
    name: 'Test',
    symbol: 'TST',
    supply: ethers.utils.parseEther('100000').toString(),
  });

  const mockErc20Address = await hre.run('deploy:mock-erc20', {
    name: 'Mock',
    symbol: 'MCK',
    supply: ethers.utils.parseEther('100000').toString(),
  });

  return {
    token: GameToken__factory.connect(gameTokenAddress, deployer),
    mockToken: ERC20Mock__factory.connect(mockErc20Address, deployer),
  };
}

export function unitTestGameToken(): void {
  const ONE_TOKEN = 10n ** 18n;
  describe('Game Token', function () {
    let MANAGER_ROLE;
    let ADMIN_ROLE;
    let token: GameToken;
    let mockToken: ERC20Mock;
    let admin: SignerWithAddress;
    let other: SignerWithAddress;
    let stranger: SignerWithAddress;

    beforeEach(async function () {
      [admin, other, stranger] = this.signers;
      ({ MANAGER_ROLE, ADMIN_ROLE } = this.roles);

      ({ token, mockToken } = await this.loadFixture(gameTokenFixture));
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
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${MANAGER_ROLE}`,
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
      beforeEach(async () => {
        await mockToken.transfer(token.address, ONE_TOKEN);
      });

      it('should be able to recover tokens', async () => {
        await token.recover(mockToken.address, other.address, ONE_TOKEN);

        await expect(mockToken.balanceOf(other.address)).to.eventually.eq(ONE_TOKEN);
      });

      it('should not allow stranger to recover tokens', async () => {
        await expect(token.connect(stranger).recover(mockToken.address, other.address, ONE_TOKEN)).to.be.rejectedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`,
        );
      });
    });
  });
}
