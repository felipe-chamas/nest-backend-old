import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, BigNumberish } from 'ethers';
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
    let user: SignerWithAddress;
    let operator: SignerWithAddress;

    beforeEach(function () {
      ({ nftBox } = this.contracts);
      ({ stranger, other, operator, user } = this.signers);
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

    context('mint', () => {
      it('should be possible to mint NFT', async () => {
        await expect(nftBox.connect(operator).mint(other.address))
          .to.emit(nftBox, 'Transfer')
          .withArgs(AddressZero, other.address, 1);

        await expect(nftBox.balanceOf(other.address)).eventually.to.eq(1);
        await expect(nftBox.tokenURI(1)).eventually.to.eq(NFT_BOX_BASE_URI + '1');
      });

      it('stranger cannot mint NFT', async () => {
        await expect(nftBox.connect(stranger).mint(other.address)).to.be.eventually.rejectedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`,
        );
      });
    });

    context('burn', () => {
      let tokenId: BigNumber;
      beforeEach(async () => {
        const tx = await nftBox.connect(operator).mint(user.address);
        const event = await getTransferEvent(tx, nftBox as unknown as ERC721Upgradeable);
        tokenId = event.tokenId;
      });

      context('when operator burns token', () => {
        it('burns', async () => {
          await expect(nftBox.connect(operator).burn(tokenId))
            .to.emit(nftBox, 'Transfer')
            .withArgs(user.address, AddressZero, tokenId);

          await expect(nftBox.ownerOf(tokenId)).to.be.revertedWith(`ERC721: owner query for nonexistent token`);
        });
      });

      context('when stranger burns token', () => {
        it('reverts', async () => {
          await expect(nftBox.connect(stranger).burn(tokenId)).to.be.eventually.rejectedWith(
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
        const tx = await nftBox.connect(operator).mint(other.address);
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
        await nft.mint(other.address);
      }

      await expect(nft.totalSupply()).eventually.to.eq(maxTokenSupply);
      await expect(nft.balanceOf(other.address)).eventually.to.eq(maxTokenSupply);
    });

    it('should not be possible to mint more than maxTokenSupply', async () => {
      for (let i = 0; i < Number(maxTokenSupply); i++) {
        await nft.mint(other.address);
      }

      await expect(nft.mint(other.address)).to.be.rejectedWith(`MaximumTotalSupplyReached(${maxTokenSupply})`);
    });
  });
}
