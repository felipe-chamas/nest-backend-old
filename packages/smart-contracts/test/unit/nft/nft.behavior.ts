import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ERC721Upgradeable, NFT } from '../../../typechain';
import { AddressZero } from '../../shared/constants';
import { getTransferEvent } from '../../shared/utils';

export function shouldBehaveLikeNFT() {
  context('NFT', function () {
    let OPERATOR_ROLE: string;
    let nft: NFT;
    let stranger: SignerWithAddress;
    let other: SignerWithAddress;
    let operator: SignerWithAddress;

    beforeEach(function () {
      ({ nft } = this.contracts);
      ({ stranger, other, operator } = this.signers);
      ({ OPERATOR_ROLE } = this.roles);
    });

    context('Basic', () => {
      it('should have name', async () => {
        await expect(nft.name()).eventually.is.not.empty;
      });

      it('should have symbol', async () => {
        await expect(nft.symbol()).eventually.is.not.empty;
      });
    });

    context('minting', () => {
      it('should be possible to mint NFT', async () => {
        await expect(nft.connect(operator).mint(other.address))
          .to.emit(nft, 'Transfer')
          .withArgs(AddressZero, other.address, 0);

        await expect(nft.balanceOf(other.address)).eventually.to.eq(1);
        await expect(nft.tokenURI(0)).eventually.to.eq('ipfs://0');
      });

      it('stranger cannot mint NFT', async () => {
        await expect(nft.connect(stranger).mint(other.address)).to.be.eventually.rejectedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`,
        );
      });
    });

    context('base token URI', () => {
      it('should allow operator to change base token URI', async () => {
        await nft.connect(operator).setBaseTokenURI('http://');

        await expect(nft.getBaseTokenURI()).eventually.to.eq('http://');
      });

      it('should not allow stranger to change base token URI', async () => {
        await expect(nft.connect(stranger).setBaseTokenURI('http://')).to.be.rejectedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`,
        );
      });
    });

    context('token URI', () => {
      let tokenId: BigNumber;
      beforeEach(async () => {
        const tx = await nft.connect(operator).mint(other.address);
        ({ tokenId } = await getTransferEvent(tx, nft as unknown as ERC721Upgradeable));
      });

      it('should allow operator to change token URI', async () => {
        await nft.connect(operator).setTokenURI(tokenId, 'tfn');

        await expect(nft.tokenURI(tokenId)).eventually.to.eq('ipfs://tfn');
      });

      it('should forbid stranger to change token URI', async () => {
        await expect(nft.connect(stranger).setTokenURI(tokenId, 'ipfs://tfn')).to.be.rejectedWith(
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
