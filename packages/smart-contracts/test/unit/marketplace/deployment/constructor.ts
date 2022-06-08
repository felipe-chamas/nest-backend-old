import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ACL, GameToken } from '../../../../typechain';
import { AddressZero, MAX_MARKETPLACE_ERC20_FEE_PERCENT } from '../../../shared/constants';
import { deployMarketplace } from '../../../shared/deployers';

export function shouldBehaveLikeConstructor() {
  let admin: SignerWithAddress;
  let custody: SignerWithAddress;
  let acl: ACL;
  let gameToken: GameToken;

  beforeEach(function () {
    ({ admin, custody } = this.signers);
    ({ acl, gameToken } = this.contracts);
  });

  it('should deploy Marketplace', async () => {
    await expect(
      deployMarketplace(admin, {
        acl: acl.address,
        custody: custody.address,
        gameToken: gameToken.address,
      }),
    ).eventually.exist;
  });

  context('when GameToken is zero address', () => {
    it('reverts', async () => {
      await expect(
        deployMarketplace(admin, {
          acl: acl.address,
          custody: custody.address,
          gameToken: AddressZero,
        }),
      ).revertedWith('GameTokenIsZeroAddress()');
    });
  });

  context('when custody is zero address', () => {
    it('reverts', async () => {
      await expect(
        deployMarketplace(admin, {
          acl: acl.address,
          custody: AddressZero,
          gameToken: gameToken.address,
        }),
      ).revertedWith('CustodyIsZeroAddress()');
    });
  });

  context('when ACL is zero address', () => {
    it('reverts', async () => {
      await expect(
        deployMarketplace(admin, {
          acl: AddressZero,
          custody: custody.address,
          gameToken: gameToken.address,
        }),
      ).revertedWith('ACLContractIsZeroAddress()');
    });
  });

  context('when marketplaceERC20FeePercent is greater than allowed maximum', () => {
    it('reverts', async () => {
      await expect(
        deployMarketplace(admin, {
          acl: acl.address,
          custody: custody.address,
          gameToken: gameToken.address,
          erc20FeePercent: MAX_MARKETPLACE_ERC20_FEE_PERCENT + 1,
        }),
      ).revertedWith(
        `MarketplaceERC20FeePercentExceedsMaximum(${MAX_MARKETPLACE_ERC20_FEE_PERCENT}, ${
          MAX_MARKETPLACE_ERC20_FEE_PERCENT + 1
        })`,
      );
    });
  });
}
