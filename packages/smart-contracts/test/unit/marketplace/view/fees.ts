import { expect } from 'chai';
import { BigNumberish } from 'ethers';
import { MarketplaceMock } from '../../../../typechain';
import { Orders } from '../../../../typechain/contracts/marketplace/Marketplace';
import { AddressZero, ONE_TOKEN } from '../../../shared/constants';
import { AssetsTypes } from '../../../shared/types';
import { createOrder, getOrderFee, makeAsset, makeERC20Asset, makeERC721Asset } from '../marketplace.utils';

export function shouldBehaveLikeMarketplaceOrderFees() {
  let marketplace: MarketplaceMock;

  beforeEach(function () {
    ({ marketplace } = this.contracts);
  });

  context('getOrderFee()', () => {
    const tests: { order: Orders.OrderStruct; msg: string; expected: BigNumberish }[] = [
      {
        order: createOrder({
          maker: AddressZero,
          makeAssets: [makeERC20Asset(AddressZero, ONE_TOKEN)],
          takeAssets: [makeERC721Asset(AddressZero, 1)],
        }),
        msg: 'one ERC20 vs one ERC721',
        expected: getOrderFee(ONE_TOKEN, 1),
      },
      {
        order: createOrder({
          maker: AddressZero,
          makeAssets: [makeERC721Asset(AddressZero, 1)],
          takeAssets: [makeERC721Asset(AddressZero, 1)],
        }),
        msg: 'one ERC721 vs one ERC721',
        expected: getOrderFee(0, 2),
      },
      {
        order: createOrder({
          maker: AddressZero,
          makeAssets: [makeERC20Asset(AddressZero, ONE_TOKEN)],
          takeAssets: [
            makeERC721Asset(AddressZero, 1),
            makeERC721Asset(AddressZero, 1),
            makeERC721Asset(AddressZero, 1),
          ],
        }),
        msg: 'one ERC20 vs three ERC721',
        expected: getOrderFee(ONE_TOKEN, 3),
      },
      {
        order: createOrder({
          maker: AddressZero,
          makeAssets: [
            makeERC721Asset(AddressZero, 1),
            makeERC721Asset(AddressZero, 1),
            makeERC721Asset(AddressZero, 1),
          ],
          takeAssets: [
            makeERC721Asset(AddressZero, 1),
            makeERC721Asset(AddressZero, 1),
            makeERC721Asset(AddressZero, 1),
          ],
        }),
        msg: 'three ERC721 vs three ERC721',
        expected: getOrderFee(0, 6),
      },
      {
        order: createOrder({
          maker: AddressZero,
          makeAssets: [makeERC20Asset(AddressZero, ONE_TOKEN * 99n), makeERC721Asset(AddressZero, 1)],
          takeAssets: [
            makeERC721Asset(AddressZero, 1),
            makeERC721Asset(AddressZero, 1),
            makeERC721Asset(AddressZero, 1),
          ],
        }),
        msg: '99 ERC20 + one ERC721 vs three ERC721',
        expected: getOrderFee(ONE_TOKEN * 99n, 4),
      },
    ];

    tests.forEach(({ order, msg, expected }) => {
      it(`calculates fees for ${msg}`, async () => {
        await expect(marketplace.getOrderFee(order)).eventually.eq(expected);
      });
    });
  });

  context('when order contains unsupported asset', () => {
    let order: Orders.OrderStruct;

    beforeEach(() => {
      order = createOrder({
        maker: AddressZero,
        makeAssets: [makeAsset(AssetsTypes.UNDEFINED, '0x', 0)],
        takeAssets: [],
      });
    });

    it('fails', async () => {
      await expect(marketplace.getOrderFee(order)).throws;
    });
  });
}
