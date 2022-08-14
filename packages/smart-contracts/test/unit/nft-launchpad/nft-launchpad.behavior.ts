import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { NFTLaunchpad } from '../../../typechain';
import { AddressZero } from '../../shared/constants';

export function shouldBehaveLikeOnlyLaunchpadIsAllowedToMint() {
  context('NFT Launchpad', function () {
    let nftLaunchpad: NFTLaunchpad;
    let stranger: SignerWithAddress;
    let launchpad: SignerWithAddress;
    let user: SignerWithAddress;

    beforeEach(function () {
      ({ nftLaunchpad } = this.contracts);
      ({ stranger, launchpad, user } = this.signers);
    });

    context('minting', () => {
      it('only launchpad can mint NFT', async () => {
        await expect(nftLaunchpad.connect(launchpad).mintTo(user.address, 2))
          .to.emit(nftLaunchpad, 'Transfer')
          .withArgs(AddressZero, user.address, 1)
          .to.emit(nftLaunchpad, 'Transfer')
          .withArgs(AddressZero, user.address, 2);

        await expect(nftLaunchpad.balanceOf(user.address)).eventually.to.eq(2);
        await expect(nftLaunchpad.tokenURI(1)).eventually.to.eq('ipfs://1');
        await expect(nftLaunchpad.tokenURI(2)).eventually.to.eq('ipfs://2');
      });

      it('stranger cannot mint NFT', async () => {
        await expect(nftLaunchpad.connect(stranger).mintTo(user.address, 3)).to.be.eventually.rejectedWith(
          `MsgSenderIsNotLaunchpad()`,
        );
      });

      it('shold not mint to invalid address', async () => {
        await expect(nftLaunchpad.connect(launchpad).mintTo(AddressZero, 3)).to.be.eventually.rejectedWith(
          `ToIsZeroAddress()`,
        );
      });

      it('shold not mint with invalid size', async () => {
        await expect(nftLaunchpad.connect(launchpad).mintTo(user.address, 0)).to.be.eventually.rejectedWith(
          `SizeIsZero()`,
        );
      });

      it('shold not mint past max supply', async () => {
        await expect(nftLaunchpad.getLaunchpadSupply()).eventually.to.eq(0);

        const maxLaunchpadSupply = await nftLaunchpad.getMaxLaunchpadSupply();
        expect(await nftLaunchpad.connect(launchpad).mintTo(user.address, maxLaunchpadSupply)).to.exist;

        await expect(nftLaunchpad.getLaunchpadSupply()).eventually.to.eq(maxLaunchpadSupply);

        await expect(nftLaunchpad.connect(launchpad).mintTo(user.address, 1)).to.be.eventually.rejectedWith(
          `MaximumLaunchpadSupplyReached(${maxLaunchpadSupply})`,
        );
      });
    });
  });
}

export function shouldBehaveLikeINFTLaunchpad(maxTokenSupply: bigint) {
  context('NFT Launchpad', function () {
    let nftLaunchpad: NFTLaunchpad;

    beforeEach(function () {
      ({ nftLaunchpad } = this.contracts);
    });

    context('INFTLaunchpad', () => {
      it('should have max launchpad supply', async () => {
        await expect(nftLaunchpad.getMaxLaunchpadSupply()).eventually.to.eq(maxTokenSupply);
      });

      it('should have launchpad supply getter', async () => {
        await expect(nftLaunchpad.getLaunchpadSupply()).eventually.to.eq(0);
      });

      it('should have mintTo', () => {
        expect(nftLaunchpad.mintTo).to.exist;
      });
    });
  });
}
