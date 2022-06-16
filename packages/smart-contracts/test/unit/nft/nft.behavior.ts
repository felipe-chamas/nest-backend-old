import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ERC721Upgradeable, NFT } from '../../../typechain';
import { AddressZero } from '../../shared/constants';
import { Roles } from '../../shared/types';
import { getTransferEvent } from '../../shared/utils';

export function shouldBehaveLikeNFT(burnEnabled: boolean) {
  context('NFT', function () {
    let nft: NFT;
    let stranger: SignerWithAddress;
    let other: SignerWithAddress;
    let operator: SignerWithAddress;
    let user: SignerWithAddress;

    beforeEach(function () {
      ({ nft } = this.contracts);
      ({ stranger, other, operator, user } = this.signers);
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
          .withArgs(AddressZero, other.address, 1);

        await expect(nft.balanceOf(other.address)).eventually.to.eq(1);
        await expect(nft.tokenURI(1)).eventually.to.eq('ipfs://1');
      });

      it('stranger cannot mint NFT', async () => {
        await expect(nft.connect(stranger).mint(other.address)).to.be.eventually.rejectedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.MINTER_ROLE}`,
        );
      });
    });

    if (burnEnabled) {
      context('burn', () => {
        let tokenId: BigNumber;
        beforeEach(async () => {
          const tx = await nft.connect(operator).mint(user.address);
          const event = await getTransferEvent(tx, nft as unknown as ERC721Upgradeable);
          tokenId = event.tokenId;
        });

        context('when operator burns token', () => {
          it('burns', async () => {
            await expect(nft.connect(operator).burn(tokenId))
              .to.emit(nft, 'Transfer')
              .withArgs(user.address, AddressZero, tokenId);

            await expect(nft.ownerOf(tokenId)).to.be.revertedWith(`ERC721: owner query for nonexistent token`);
          });
        });

        context('when stranger burns token', () => {
          it('reverts', async () => {
            await expect(nft.connect(stranger).burn(tokenId)).to.be.eventually.rejectedWith(
              `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.MINTER_ROLE}`,
            );
          });
        });
      });
    }

    context('base token URI', () => {
      it('should allow operator to change base token URI', async () => {
        await nft.connect(operator).setBaseTokenURI('http://');

        await expect(nft.getBaseTokenURI()).eventually.to.eq('http://');
      });

      it('should not allow stranger to change base token URI', async () => {
        await expect(nft.connect(stranger).setBaseTokenURI('http://')).to.be.rejectedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.OPERATOR_ROLE}`,
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
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.OPERATOR_ROLE}`,
        );
      });
    });
  });
}

export function shouldBehaveLikeNFTWithLimitedSupply(maxTokenSupply: bigint) {
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
