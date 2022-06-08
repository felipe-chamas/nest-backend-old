import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { MarketplaceMock } from '../../../../typechain';
import { AddressZero, MAX_MARKETPLACE_ERC20_FEE_PERCENT } from '../../../shared/constants';
import { Roles } from '../../../shared/types';

export function shouldBehaveLikeMarketplaceSetters() {
  let marketplace: MarketplaceMock;
  let user: SignerWithAddress;
  let stranger: SignerWithAddress;

  beforeEach(function () {
    ({ user, stranger } = this.signers);
    ({ marketplace } = this.contracts);
  });

  context('marketplaceERC20FeePercent', () => {
    context('when admin', () => {
      context('sets fee', () => {
        it('works', async () => {
          await expect(marketplace.setMarketplaceERC20FeePercent(100))
            .emit(marketplace, 'MarketplaceERC20FeePercentChanged')
            .withArgs(100);

          await expect(marketplace.getMarketplaceERC20FeePercent()).eventually.eq(100);
        });
      });

      context('sets fee above maximum allowed', () => {
        it('reverts', async () => {
          await expect(marketplace.setMarketplaceERC20FeePercent(MAX_MARKETPLACE_ERC20_FEE_PERCENT + 1)).revertedWith(
            `MarketplaceERC20FeePercentExceedsMaximum(${MAX_MARKETPLACE_ERC20_FEE_PERCENT}, ${
              MAX_MARKETPLACE_ERC20_FEE_PERCENT + 1
            })`,
          );
        });
      });
    });

    context('when stranger', () => {
      context('sets fee', () => {
        it('reverts', async () => {
          await expect(marketplace.connect(stranger).setMarketplaceERC20FeePercent(100)).revertedWith(
            `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.ADMIN_ROLE}`,
          );
        });
      });
    });
  });

  context('marketplaceNFTFee', () => {
    context('when admin', () => {
      context('sets fee', () => {
        it('works', async () => {
          await expect(marketplace.setMarketplaceNFTFee(100))
            .emit(marketplace, 'MarketplaceNFTFeeChanged')
            .withArgs(100);

          await expect(marketplace.getMarketplaceNFTFee()).eventually.eq(100);
        });
      });
    });

    context('when stranger', () => {
      context('sets fee', () => {
        it('reverts', async () => {
          await expect(marketplace.connect(stranger).setMarketplaceNFTFee(100)).revertedWith(
            `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.ADMIN_ROLE}`,
          );
        });
      });
    });
  });

  context('custody', () => {
    context('when admin', () => {
      context('sets custody', () => {
        context('correct address', () => {
          it('works', async () => {
            await expect(marketplace.setCustody(user.address))
              .emit(marketplace, 'CustodyChanged')
              .withArgs(user.address);
            await expect(marketplace.getCustody()).eventually.eq(user.address);
          });
        });

        context('zero address', () => {
          it('reverts', async () => {
            await expect(marketplace.setCustody(AddressZero)).revertedWith('CustodyIsZeroAddress()');
          });
        });
      });
    });

    context('when stranger', () => {
      context('sets custody', () => {
        it('reverts', async () => {
          await expect(marketplace.connect(stranger).setCustody(stranger.address)).revertedWith(
            `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.ADMIN_ROLE}`,
          );
        });
      });
    });
  });
}
