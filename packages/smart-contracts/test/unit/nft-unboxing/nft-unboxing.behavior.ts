import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ERC721Upgradeable, NFT, NFTBox, NFTUnboxing, VRFCoordinatorV2Mock } from '../../../typechain';
import { Roles } from '../../shared/types';
import { getTransferEvent, getUnboxedEvent } from '../../shared/utils';

export const NFT_BOX_BASE_URI = 'http://harvest.io/box/';

export function shouldBehaveLikeNFTUnboxing() {
  context('NFT Unboxing', () => {
    let nftBox: NFTBox;
    let nftUnboxing: NFTUnboxing;
    let vrfCoordinator: VRFCoordinatorV2Mock;
    let stranger: SignerWithAddress;
    let user: SignerWithAddress;
    let other: SignerWithAddress;
    let operator: SignerWithAddress;
    let nftBoxId: BigNumber;
    let collection: NFT[];

    beforeEach(async function () {
      ({ nftBox, nftUnboxing, vrfCoordinator, collection } = this.contracts);
      ({ stranger, operator, user, other } = this.signers);

      const tx = await nftBox.connect(operator).mint(user.address);

      ({ tokenId: nftBoxId } = await getTransferEvent(tx, nftBox as unknown as ERC721Upgradeable));
    });

    context('when user requests unboxing', () => {
      context('on non-existent NFT box', () => {
        it('reverts', async () => {
          await expect(nftUnboxing.connect(user).requestUnboxing(999)).to.revertedWith(
            'ERC721: operator query for nonexistent token',
          );
        });
      });

      context('on existing NFT box', () => {
        it('works', async () => {
          await expect(nftUnboxing.connect(user).requestUnboxing(nftBoxId))
            .to.emit(nftUnboxing, 'UnboxingRequested')
            .withArgs(1, nftBoxId);

          await expect(nftUnboxing.getRequestId(nftBoxId)).eventually.to.eq(1);
          await expect(nftUnboxing.getTokenId(1)).eventually.to.eq(nftBoxId);
          await expect(nftUnboxing.getRandomResultByTokenId(nftBoxId)).eventually.to.eq('0');
        });
      });

      context('when user requests unboxing again', () => {
        beforeEach(async () => {
          await nftUnboxing.connect(user).requestUnboxing(nftBoxId);
        });

        it('reverts', async () => {
          await expect(nftUnboxing.connect(user).requestUnboxing(nftBoxId)).revertedWith(
            `UnboxingAlreadyRequested(${nftBoxId})`,
          );
        });
      });
    });

    context('when stranger requests unboxing', () => {
      it('reverts', async () => {
        await expect(nftUnboxing.connect(stranger).requestUnboxing(nftBoxId)).revertedWith(
          `RequesterIsNotTokenOwnerOrApproved(${nftBoxId})`,
        );
      });
    });

    context('when user approves token', () => {
      context('for all', () => {
        beforeEach(async () => {
          await nftBox.connect(user).setApprovalForAll(other.address, true);
        });

        it('succeeds', async () => {
          await expect(nftUnboxing.connect(other).requestUnboxing(nftBoxId))
            .to.emit(nftUnboxing, 'UnboxingRequested')
            .withArgs(1, nftBoxId);
        });
      });

      context('for tokenId', () => {
        beforeEach(async () => {
          await nftBox.connect(user).approve(other.address, nftBoxId);
        });

        it('succeeds', async () => {
          await expect(nftUnboxing.connect(other).requestUnboxing(nftBoxId))
            .to.emit(nftUnboxing, 'UnboxingRequested')
            .withArgs(1, nftBoxId);
        });
      });

      context('for tokenId, but other user uses wrong tokenId', () => {
        beforeEach(async () => {
          const tx = await nftBox.connect(operator).mint(user.address);
          const event = await getTransferEvent(tx, nftBox as unknown as ERC721Upgradeable);

          await nftBox.connect(user).approve(other.address, event.tokenId);
        });

        it('reverts', async () => {
          await expect(nftUnboxing.connect(other).requestUnboxing(nftBoxId)).revertedWith(
            `RequesterIsNotTokenOwnerOrApproved(${nftBoxId})`,
          );
        });
      });
    });

    context('when user requested unboxing', () => {
      beforeEach(async () => {
        await nftUnboxing.connect(user).requestUnboxing(nftBoxId);
      });

      context('when Chainlink responds with random number', () => {
        beforeEach(async () => {
          const requestId = await nftUnboxing.getRequestId(nftBoxId);

          await vrfCoordinator.fulfillRandomWords(requestId, nftUnboxing.address);
        });

        it('stores the result', async () => {
          await expect(nftUnboxing.getRandomResultByTokenId(nftBoxId)).eventually.not.eq('0');
        });
      });
    });

    context('completeUnboxing', () => {
      let requestId: BigNumber;
      beforeEach(async () => {
        await nftUnboxing.connect(user).requestUnboxing(nftBoxId);
        requestId = await nftUnboxing.getRequestId(nftBoxId);
        await vrfCoordinator.fulfillRandomWords(requestId, nftUnboxing.address);
      });

      context('when operator completes unboxing', () => {
        it('works', async () => {
          const tx = await nftUnboxing.connect(operator).completeUnboxing(
            requestId,
            collection.map(x => x.address),
            collection.map(_ => 2),
          );

          await expect(tx)
            .to.emit(nftUnboxing, 'Unboxed')
            .withArgs(
              requestId,
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

      context('when operator completes unboxing again', () => {
        beforeEach(async () => {
          await nftUnboxing.connect(operator).completeUnboxing(
            requestId,
            collection.map(x => x.address),
            collection.map(_ => 1),
          );
        });

        it('reverts', async () => {
          await expect(
            nftUnboxing.connect(operator).completeUnboxing(
              requestId,
              collection.map(x => x.address),
              collection.map(_ => 1),
            ),
          ).to.be.reverted;
        });
      });

      context('when stranger completes unboxing', () => {
        it('reverts', async () => {
          await expect(
            nftUnboxing.connect(stranger).completeUnboxing(
              requestId,
              collection.map(x => x.address),
              collection.map(_ => 1),
            ),
          ).to.be.revertedWith(
            `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.OPERATOR_ROLE}`,
          );
        });
      });

      context('when user transfers NFT box to other user after requesting unboxing', () => {
        beforeEach(async () => {
          await nftBox
            .connect(user)
            ['safeTransferFrom(address,address,uint256)'](user.address, other.address, nftBoxId);
        });

        it('mints unboxed tokens to other user', async () => {
          await nftUnboxing.connect(operator).completeUnboxing(
            requestId,
            collection.map(x => x.address),
            collection.map(_ => 1),
          );

          await expect(collection[0].balanceOf(other.address)).eventually.eq(1);
          await expect(collection[1].balanceOf(other.address)).eventually.eq(1);
        });
      });

      context('when array lengths does not match', () => {
        it('reverts', async () => {
          await expect(
            nftUnboxing.connect(operator).completeUnboxing(
              requestId,
              collection.map(x => x.address),
              [1],
            ),
          ).to.revertedWith(`ArrayLengthsDoesNotMatch(${collection.length}, 1)`);
        });
      });

      context('when operator specifies unknown requestId', () => {
        it('reverts', async () => {
          await expect(
            nftUnboxing.connect(operator).completeUnboxing(
              999999,
              collection.map(x => x.address),
              collection.map(_ => 1),
            ),
          ).to.revertedWith(`UnregisteredRequestId(999999)`);
        });
      });
    });
  });
}
