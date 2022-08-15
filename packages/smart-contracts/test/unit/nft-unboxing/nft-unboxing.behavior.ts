import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ERC721Upgradeable, NFT, NFTUnboxing } from '../../../typechain';
import { Roles } from '../../shared/types';
import { getTransferEvent, getUnboxedEvent } from '../../shared/utils';

export const NFT_BOX_BASE_URI = 'http://harvest.io/box/';

export function shouldBehaveLikeNFTUnboxing() {
  context('NFT Unboxing', () => {
    let nft: NFT;
    let nftUnboxing: NFTUnboxing;
    let stranger: SignerWithAddress;
    let user: SignerWithAddress;
    let other: SignerWithAddress;
    let operator: SignerWithAddress;
    let nftBoxId: BigNumber;
    let collection: NFT[];

    beforeEach(async function () {
      ({ nft, nftUnboxing, collection } = this.contracts);
      ({ stranger, operator, user, other } = this.signers);

      const tx = await nft.connect(operator).mint(user.address);

      ({ tokenId: nftBoxId } = await getTransferEvent(tx, nft as unknown as ERC721Upgradeable));
    });

    context('when operator requests unboxing', () => {
      context('on non-existent NFT box', () => {
        it('reverts', async () => {
          await expect(nftUnboxing.connect(operator).unbox(999, [nft.address], [3])).to.revertedWith(
            'ERC721: owner query for nonexistent token',
          );
        });
      });

      context('on existing NFT box', () => {
        it('works', async () => {
          const tx = await nftUnboxing.connect(operator).unbox(
            nftBoxId,
            collection.map(x => x.address),
            collection.map(() => 2),
          );

          await expect(tx)
            .to.emit(nftUnboxing, 'Unboxed')
            .withArgs(
              nftBoxId,
              collection.map(x => x.address),
              [], // chai matcher fails to validate 2D array
            );

          const event = await getUnboxedEvent(tx, nftUnboxing);
          expect(event.mintedTokenIds[0][0]).to.eq(1);
          expect(event.mintedTokenIds[0][1]).to.eq(2);
          expect(event.mintedTokenIds[1][0]).to.eq(1);
          expect(event.mintedTokenIds[1][1]).to.eq(2);
          await expect(collection[0].balanceOf(user.address)).eventually.eq(2);
          await expect(collection[1].balanceOf(user.address)).eventually.eq(2);
        });
      });

      context('when requested unboxing again', () => {
        beforeEach(async () => {
          await nftUnboxing.connect(operator).unbox(
            nftBoxId,
            collection.map(x => x.address),
            collection.map(() => 2),
          );
        });

        it('reverts', async () => {
          await expect(
            nftUnboxing.connect(operator).unbox(
              nftBoxId,
              collection.map(x => x.address),
              collection.map(() => 2),
            ),
          ).revertedWith('ERC721: owner query for nonexistent token');
        });
      });
    });

    context('when stranger requests unboxing', () => {
      it('reverts', async () => {
        await expect(
          nftUnboxing.connect(stranger).unbox(
            nftBoxId,
            collection.map(x => x.address),
            collection.map(() => 2),
          ),
        ).revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.OPERATOR_ROLE}`,
        );
      });
    });

    context('completeUnboxing', () => {
      context('when user transfers NFT box to other user after requesting unboxing', () => {
        beforeEach(async () => {
          await nft.connect(user)['safeTransferFrom(address,address,uint256)'](user.address, other.address, nftBoxId);
        });

        it('mints unboxed tokens to other user', async () => {
          await nftUnboxing.connect(operator).unbox(
            nftBoxId,
            collection.map(x => x.address),
            collection.map(() => 1),
          );

          await expect(collection[0].balanceOf(other.address)).eventually.eq(1);
          await expect(collection[1].balanceOf(other.address)).eventually.eq(1);
        });
      });

      context('when array lengths does not match', () => {
        it('reverts', async () => {
          await expect(
            nftUnboxing.connect(operator).unbox(
              nftBoxId,
              collection.map(x => x.address),
              [1],
            ),
          ).to.revertedWith(`ArrayLengthsDoesNotMatch(${collection.length}, 1)`);
        });
      });
    });
  });
}
