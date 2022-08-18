import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ERC20Mock, ERC721Upgradeable, NFT, NFTLevelUp } from '../../../typechain';
import { ONE_TOKEN } from '../../shared/constants';
import { Roles } from '../../shared/types';
import { getTransferEvent } from '../../shared/utils';

export const NFT_BOX_BASE_URI = 'http://harvest.io/box/';

export function shouldBehaveLikeNFTLevelUp(levelUpValue: bigint): void {
  context('NFT LevelUp', () => {
    let nft: NFT;
    let nftLevelUp: NFTLevelUp;
    let mockToken: ERC20Mock;
    let stranger: SignerWithAddress;
    let user: SignerWithAddress;
    let other: SignerWithAddress;
    let operator: SignerWithAddress;
    let admin: SignerWithAddress;
    let nftId: BigNumber;
    let burnerId: BigNumber;
    let otherId: BigNumber;

    beforeEach(function () {
      ({ nft, nftLevelUp, mockToken } = this.contracts);
      ({ admin, stranger, operator, user, other } = this.signers);
    });

    context('basic', () => {
      it('gets levelup value', async () => {
        await expect(nftLevelUp.connect(operator).getLevelUpValue()).eventually.to.equal(levelUpValue);
      });

      it('works when operator changes levelup value', async () => {
        await expect(nftLevelUp.connect(operator).setLevelUpValue((ONE_TOKEN * 3n) / 10n))
          .to.emit(nftLevelUp, 'LevelUpValueChanged')
          .withArgs(levelUpValue, (ONE_TOKEN * 3n) / 10n);
      });

      it('fails when stranger changes levelup value', async () => {
        await expect(nftLevelUp.connect(stranger).setLevelUpValue(ONE_TOKEN * 2n)).to.be.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.OPERATOR_ROLE}`,
        );
      });

      it('works when admin changes receiver', async () => {
        await expect(nftLevelUp.connect(admin).changeReceiver(other.address))
          .to.emit(nftLevelUp, 'ReceiverChanged')
          .withArgs(admin.address, other.address);
      });

      it('fails when stranger changes receiver', async () => {
        await expect(nftLevelUp.connect(stranger).changeReceiver(stranger.address)).to.be.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.ADMIN_ROLE}`,
        );
      });
    });

    context('Upgrade', () => {
      beforeEach(async () => {
        const txNft = await nft.connect(operator).mint(user.address);
        const txBurner = await nft.connect(operator).mint(user.address);
        const txOther = await nft.connect(operator).mint(other.address);

        ({ tokenId: nftId } = await getTransferEvent(txNft, nft as unknown as ERC721Upgradeable));
        ({ tokenId: burnerId } = await getTransferEvent(txBurner, nft as unknown as ERC721Upgradeable));
        ({ tokenId: otherId } = await getTransferEvent(txOther, nft as unknown as ERC721Upgradeable));
      });

      context('when operator requests upgrade', () => {
        it('works', async () => {
          await expect(nftLevelUp.connect(operator).upgradeNFT(nft.address, nftId, burnerId))
            .to.emit(nftLevelUp, 'NFTUpgraded')
            .withArgs(nft.address, nftId);
          await expect(nft.ownerOf(burnerId)).to.be.revertedWith(`ERC721: owner query for nonexistent token`);
        });

        it('fails when nftId and burnerId are the same', async () => {
          await expect(nftLevelUp.connect(operator).upgradeNFT(nft.address, nftId, nftId)).to.revertedWith(
            `BurnerEqualsToken(${nftId})`,
          );
        });

        it('fails when nftId and burnerId are owned by different users', async () => {
          await expect(nftLevelUp.connect(operator).upgradeNFT(nft.address, nftId, otherId)).to.revertedWith(
            `NFTsOwnershipMismatch("${user.address}", "${other.address}")`,
          );
        });
      });

      context('when stranger requests upgrade', () => {
        it('reverts', async () => {
          await expect(nftLevelUp.connect(stranger).upgradeNFT(nft.address, nftId, burnerId)).revertedWith(
            `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.OPERATOR_ROLE}`,
          );
        });
      });
    });

    context('Level Up', () => {
      beforeEach(async () => {
        await mockToken.transfer(user.address, levelUpValue);
        await mockToken.connect(user).approve(nftLevelUp.address, levelUpValue);

        const txNft = await nft.connect(operator).mint(user.address);
        ({ tokenId: nftId } = await getTransferEvent(txNft, nft as unknown as ERC721Upgradeable));
      });

      context('when user requests levelup', () => {
        it('works', async () => {
          await expect(() => nftLevelUp.connect(user).levelUpNFT(mockToken.address, nft.address, nftId))
            .to.emit(nftLevelUp, 'NFTLeveledUp')
            .withArgs(nft.address, nftId)
            .changeTokenBalances(mockToken, [user, admin], [-levelUpValue, levelUpValue]);
        });
      });
    });
  });
}
