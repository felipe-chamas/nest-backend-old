import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ERC721Upgradeable, NFT, NFTBox } from '../../../typechain';
import { AddressZero } from '../../shared/constants';
import { getTransferEvent } from '../../shared/utils';
export const NFT_BOX_BASE_URI = 'http://harvest.io/box/';

export function shouldBehaveLikeNFTBox() {
  context('NFT Box', function () {
    let OPERATOR_ROLE: string;
    let nftBox: NFTBox;
    let stranger: SignerWithAddress;
    let other: SignerWithAddress;
    let operator: SignerWithAddress;

    beforeEach(function () {
      ({ nftBox } = this.contracts);
      ({ stranger, other, operator } = this.signers);
      ({ OPERATOR_ROLE } = this.roles);
    });

    context('Basic', () => {
      it('should have name', async () => {
        await expect(nftBox.name()).eventually.is.not.empty;
      });

      it('should have symbol', async () => {
        await expect(nftBox.symbol()).eventually.is.not.empty;
      });
    });

    context('minting', () => {
      it('should be possible to mint NFT', async () => {
        await expect(nftBox.connect(operator).mint(other.address, 1))
          .to.emit(nftBox, 'Transfer')
          .withArgs(AddressZero, other.address, 0);

        await expect(nftBox.balanceOf(other.address)).eventually.to.eq(1);
        await expect(nftBox.tokenURI(0)).eventually.to.eq(NFT_BOX_BASE_URI + '0');
      });

      it('stranger cannot mint NFT', async () => {
        await expect(nftBox.connect(stranger).mint(other.address, 1)).to.be.eventually.rejectedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`,
        );
      });
    });

    context('batched minting', () => {
      context('when operator mints multiple NFTs in one call', () => {
        it('works', async () => {
          await expect(nftBox.connect(operator).mint(other.address, 5))
            .to.emit(nftBox, 'Transfer')
            .withArgs(AddressZero, other.address, 0)
            .emit(nftBox, 'Transfer')
            .withArgs(AddressZero, other.address, 1)
            .emit(nftBox, 'Transfer')
            .withArgs(AddressZero, other.address, 2)
            .emit(nftBox, 'Transfer')
            .withArgs(AddressZero, other.address, 3)
            .emit(nftBox, 'Transfer')
            .withArgs(AddressZero, other.address, 4);

          await expect(nftBox.balanceOf(other.address)).eventually.to.eq(5);
          for (let i = 0; i < 5; i++) {
            await expect(nftBox.tokenURI(i)).eventually.to.eq(NFT_BOX_BASE_URI + i);
          }
        });
      });

      context('when operator does multiple batch txs', () => {
        beforeEach(async () => {
          await nftBox.connect(operator).mint(other.address, 5);
        });

        it('works', async () => {
          await expect(nftBox.connect(operator).mint(other.address, 5))
            .to.emit(nftBox, 'Transfer')
            .withArgs(AddressZero, other.address, 5)
            .emit(nftBox, 'Transfer')
            .withArgs(AddressZero, other.address, 6)
            .emit(nftBox, 'Transfer')
            .withArgs(AddressZero, other.address, 7)
            .emit(nftBox, 'Transfer')
            .withArgs(AddressZero, other.address, 8)
            .emit(nftBox, 'Transfer')
            .withArgs(AddressZero, other.address, 9);

          await expect(nftBox.balanceOf(other.address)).eventually.to.eq(10);
          for (let i = 5; i < 10; i++) {
            await expect(nftBox.tokenURI(i)).eventually.to.eq(NFT_BOX_BASE_URI + i);
          }
        });
      });

      context('when stranger tries to batch mint NFTs', () => {
        it('reverts', async () => {
          await expect(nftBox.connect(stranger).mint(other.address, 5)).to.be.revertedWith(
            `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`,
          );
        });
      });
    });

    context('base token URI', () => {
      it('should allow operator to change base token URI', async () => {
        await nftBox.connect(operator).setBaseTokenURI('http://');

        await expect(nftBox.getBaseTokenURI()).eventually.to.eq('http://');
      });

      it('should not allow stranger to change base token URI', async () => {
        await expect(nftBox.connect(stranger).setBaseTokenURI('http://')).to.be.rejectedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`,
        );
      });
    });

    context('token URI', () => {
      let tokenId: BigNumber;
      beforeEach(async () => {
        const tx = await nftBox.connect(operator).mint(other.address, 1);
        ({ tokenId } = await getTransferEvent(tx, nftBox as unknown as ERC721Upgradeable));
      });

      it('should allow operator to change token URI', async () => {
        await nftBox.connect(operator).setTokenURI(tokenId, 'tfn');

        await expect(nftBox.tokenURI(tokenId)).eventually.to.eq(NFT_BOX_BASE_URI + 'tfn');
      });

      it('should forbid stranger to change token URI', async () => {
        await expect(nftBox.connect(stranger).setTokenURI(tokenId, 'ipfs://tfn')).to.be.rejectedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`,
        );
      });
    });
  });
}

export function shouldBehaveLikeNFTWithLimitedSupply(maxTokenSupply: BigInt) {
  context(`Max Token Supply: ${maxTokenSupply}`, function () {
    let nft: NFT;
    let other: SignerWithAddress;
    let operator: SignerWithAddress;

    beforeEach(function () {
      ({ other, operator } = this.signers);
      const { nft: adminNFT } = this.contracts;

      nft = adminNFT.connect(operator);
    });

    it('should return max token supply', async () => {
      await expect(nft.getMaxTokenSupply()).eventually.to.eq(maxTokenSupply);
    });

    it('should be possible to mint up to maxTokenSupply', async () => {
      for (let i = 0; i < Number(maxTokenSupply); i++) {
        await nft.mint(other.address, 'nft');
      }

      await expect(nft.totalSupply()).eventually.to.eq(maxTokenSupply);
      await expect(nft.balanceOf(other.address)).eventually.to.eq(maxTokenSupply);
    });

    it('should not be possible to mint more than maxTokenSupply', async () => {
      for (let i = 0; i < Number(maxTokenSupply); i++) {
        await nft.mint(other.address, 'nft');
      }

      await expect(nft.mint(other.address, 'nft')).to.be.rejectedWith(`MaximumTotalSupplyReached(${maxTokenSupply})`);
    });
  });
}
