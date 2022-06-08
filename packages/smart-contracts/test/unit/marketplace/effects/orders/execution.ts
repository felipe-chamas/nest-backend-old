import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumberish } from 'ethers';
import { ERC20Mock, ERC721Upgradeable, GameToken, MarketplaceMock, NFT } from '../../../../../typechain';
import { Orders, Permits } from '../../../../../typechain/Marketplace';
import { ONE_TOKEN } from '../../../../shared/constants';
import { AssetsTypes } from '../../../../shared/types';
import { getTransferEvent, OrderSigner } from '../../../../shared/utils';
import {
  createOrder,
  createTakerOrder,
  getOrderFee,
  makeAsset,
  makeERC20Asset,
  makeERC721Asset,
  makePermit,
  makePermits,
  matchOrders,
  matchOrdersWithPermits,
  matchOrdersWithPermitsAndSenderPermit,
} from '../../marketplace.utils';

export function shouldBehaveLikeMarketplaceOrderMatching() {
  let marketplace: MarketplaceMock;
  let gameToken: GameToken;
  let mockToken: ERC20Mock;
  let nft: NFT;
  let admin: SignerWithAddress;
  let maker: SignerWithAddress;
  let taker: SignerWithAddress;
  let stranger: SignerWithAddress;
  let operator: SignerWithAddress;
  let custody: SignerWithAddress;
  let orderSigner: OrderSigner;
  const makerTokenIds: BigNumberish[] = [];
  const takerTokenIds: BigNumberish[] = [];

  beforeEach(async function () {
    ({ admin, user: maker, other: taker, operator, stranger, custody } = this.signers);
    ({ nft, gameToken, marketplace, mockToken } = this.contracts);

    for (let i = 0; i < 5; i++) {
      const tx = await nft.connect(operator).mint(taker.address);
      const { tokenId } = await getTransferEvent(tx, nft as unknown as ERC721Upgradeable);
      takerTokenIds.push(tokenId);
    }

    for (let i = 0; i < 5; i++) {
      const tx = await nft.connect(operator).mint(maker.address);
      const { tokenId } = await getTransferEvent(tx, nft as unknown as ERC721Upgradeable);
      makerTokenIds.push(tokenId);
    }

    await gameToken.transfer(maker.address, ONE_TOKEN * 1_000n);
    await gameToken.transfer(taker.address, ONE_TOKEN * 1_000n);

    orderSigner = new OrderSigner(this.chainId, marketplace.address);
  });

  type ERC20Changes = { account: SignerWithAddress; amount: BigNumberish }[];
  type ERC721Changes = { owner: SignerWithAddress; tokenId: BigNumberish }[];

  context('successfully executes', () => {
    const tests: {
      msg: string;
      fn: () => {
        order: Orders.OrderStruct;
        erc20Changes: ERC20Changes;
        erc721Changes: ERC721Changes;
      };
    }[] = [
      {
        msg: 'ERC20 vs ERC721',
        fn: () => ({
          order: createOrder({
            maker: maker.address,
            makeAssets: [makeERC20Asset(gameToken.address, ONE_TOKEN)],
            takeAssets: [makeERC721Asset(nft.address, takerTokenIds[0])],
          }),
          erc20Changes: [
            { account: maker, amount: -ONE_TOKEN },
            { account: taker, amount: ONE_TOKEN },
            { account: admin, amount: -getOrderFee(ONE_TOKEN, 1) },
            { account: custody, amount: getOrderFee(ONE_TOKEN, 1) },
          ],
          erc721Changes: [{ owner: maker, tokenId: takerTokenIds[0] }],
        }),
      },
      {
        msg: 'ERC721 vs ERC721',
        fn: () => ({
          order: createOrder({
            maker: maker.address,
            makeAssets: [makeERC721Asset(nft.address, makerTokenIds[0])],
            takeAssets: [makeERC721Asset(nft.address, takerTokenIds[0])],
          }),
          erc20Changes: [
            { account: admin, amount: -getOrderFee(0, 2) },
            { account: custody, amount: getOrderFee(0, 2) },
          ],
          erc721Changes: [
            { owner: maker, tokenId: takerTokenIds[0] },
            { owner: taker, tokenId: makerTokenIds[0] },
          ],
        }),
      },
      {
        msg: 'ERC721 vs ERC20',
        fn: () => ({
          order: createOrder({
            maker: maker.address,
            makeAssets: [makeERC721Asset(nft.address, makerTokenIds[0])],
            takeAssets: [makeERC20Asset(gameToken.address, ONE_TOKEN)],
          }),
          erc20Changes: [
            { account: taker, amount: -ONE_TOKEN },
            { account: maker, amount: ONE_TOKEN },
            { account: admin, amount: -getOrderFee(ONE_TOKEN, 1) },
            { account: custody, amount: getOrderFee(ONE_TOKEN, 1) },
          ],
          erc721Changes: [{ owner: taker, tokenId: makerTokenIds[0] }],
        }),
      },
      {
        msg: 'two ERC721 vs ERC20',
        fn: () => ({
          order: createOrder({
            maker: maker.address,
            makeAssets: [
              makeERC721Asset(nft.address, makerTokenIds[0]),
              makeERC721Asset(nft.address, makerTokenIds[1]),
            ],
            takeAssets: [makeERC20Asset(gameToken.address, ONE_TOKEN)],
          }),
          erc20Changes: [
            { account: taker, amount: -ONE_TOKEN },
            { account: maker, amount: ONE_TOKEN },
            { account: admin, amount: -getOrderFee(ONE_TOKEN, 2) },
            { account: custody, amount: getOrderFee(ONE_TOKEN, 2) },
          ],
          erc721Changes: [
            { owner: taker, tokenId: makerTokenIds[0] },
            { owner: taker, tokenId: makerTokenIds[1] },
          ],
        }),
      },
      {
        msg: 'three ERC721 + ERC20 vs two ERC721',
        fn: () => ({
          order: createOrder({
            maker: maker.address,
            makeAssets: [
              makeERC721Asset(nft.address, makerTokenIds[0]),
              makeERC721Asset(nft.address, makerTokenIds[1]),
              makeERC721Asset(nft.address, makerTokenIds[2]),
              makeERC20Asset(gameToken.address, ONE_TOKEN),
            ],
            takeAssets: [
              makeERC721Asset(nft.address, takerTokenIds[0]),
              makeERC721Asset(nft.address, takerTokenIds[1]),
            ],
          }),
          erc20Changes: [
            { account: maker, amount: -ONE_TOKEN },
            { account: taker, amount: ONE_TOKEN },
            { account: admin, amount: -getOrderFee(ONE_TOKEN, 5) },
            { account: custody, amount: getOrderFee(ONE_TOKEN, 5) },
          ],
          erc721Changes: [
            { owner: maker, tokenId: takerTokenIds[0] },
            { owner: maker, tokenId: takerTokenIds[1] },
            { owner: taker, tokenId: makerTokenIds[0] },
            { owner: taker, tokenId: makerTokenIds[1] },
            { owner: taker, tokenId: makerTokenIds[2] },
          ],
        }),
      },
    ];

    context('when both orders are signed', () => {
      tests.forEach(({ msg, fn }) => {
        let makerSignature: string;
        let takerSignature: string;
        let takerOrder: Orders.OrderStruct;
        let makerOrder: Orders.OrderStruct;
        let erc20Changes: ERC20Changes;
        let erc721Changes: ERC721Changes;

        beforeEach(async () => {
          ({ order: makerOrder, erc20Changes, erc721Changes } = fn());

          takerOrder = createTakerOrder(taker.address, makerOrder);
          makerSignature = await orderSigner.signOrder(maker, makerOrder);
          takerSignature = await orderSigner.signOrder(taker, takerOrder);
        });

        context('when matchOrders() is used', () => {
          beforeEach(async () => {
            await approveAll();
          });

          it(msg, async () => {
            await expect(() =>
              marketplace.matchOrders(makerOrder, makerSignature, takerOrder, takerSignature, {
                gasLimit: 10000000,
              }),
            ).changeTokenBalances(
              gameToken,
              erc20Changes.map(x => x.account),
              erc20Changes.map(x => x.amount),
            );

            for (const { owner, tokenId } of erc721Changes) {
              await expect(nft.ownerOf(tokenId)).eventually.eq(owner.address);
            }
          });
        });

        context('when matchOrdersWithPermits() is used', () => {
          let makerPermits: Permits.PermitStruct[];
          let takerPermits: Permits.PermitStruct[];
          beforeEach(async () => {
            await gameToken.approve(marketplace.address, ONE_TOKEN * 1_000n); // for paying fees

            makerPermits = await makePermits(maker, marketplace.address, makerOrder.makeAssets);
            takerPermits = await makePermits(taker, marketplace.address, takerOrder.makeAssets);
          });

          it(msg, async () => {
            await expect(() =>
              marketplace.matchOrdersWithPermits(
                makerOrder,
                makerSignature,
                takerOrder,
                takerSignature,
                makerPermits,
                takerPermits,
                { gasLimit: 10000000 },
              ),
            ).changeTokenBalances(
              gameToken,
              erc20Changes.map(x => x.account),
              erc20Changes.map(x => x.amount),
            );

            for (const { owner, tokenId } of erc721Changes) {
              await expect(nft.ownerOf(tokenId)).eventually.eq(owner.address);
            }
          });
        });

        context('when matchOrdersWithPermitsAndSenderPermit() is used', () => {
          let makerPermits: Permits.PermitStruct[];
          let takerPermits: Permits.PermitStruct[];
          let senderPermit: Permits.PermitStruct;

          beforeEach(async () => {
            makerPermits = await makePermits(maker, marketplace.address, makerOrder.makeAssets);
            takerPermits = await makePermits(taker, marketplace.address, takerOrder.makeAssets);
            senderPermit = await makePermit(
              admin,
              marketplace.address,
              makeERC20Asset(gameToken.address, ONE_TOKEN * 1_000n),
            );
          });

          it(msg, async () => {
            await expect(() =>
              marketplace.matchOrdersWithPermitsAndSenderPermit(
                makerOrder,
                makerSignature,
                takerOrder,
                takerSignature,
                makerPermits,
                takerPermits,
                senderPermit,
                { gasLimit: 10000000 },
              ),
            ).changeTokenBalances(
              gameToken,
              erc20Changes.map(x => x.account),
              erc20Changes.map(x => x.amount),
            );

            for (const { owner, tokenId } of erc721Changes) {
              await expect(nft.ownerOf(tokenId)).eventually.eq(owner.address);
            }
          });
        });
      });
    });
  });

  context('when unsupported ERC20 token is used', () => {
    let makerOrder: Orders.OrderStruct;
    let takerOrder: Orders.OrderStruct;
    beforeEach(() => {
      makerOrder = createOrder({
        maker: maker.address,
        makeAssets: [makeERC20Asset(mockToken.address, ONE_TOKEN)],
        takeAssets: [makeERC721Asset(nft.address, 1)],
      });
      takerOrder = createTakerOrder(taker.address, makerOrder);
    });

    it('reverts', async () => {
      await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner)).revertedWith(
        `UnsupportedERC20Token("${mockToken.address}")`,
      );
    });
  });

  context('when unsupported asset class is used', () => {
    let makerOrder: Orders.OrderStruct;
    let takerOrder: Orders.OrderStruct;
    beforeEach(() => {
      makerOrder = createOrder({
        maker: maker.address,
        makeAssets: [makeAsset(AssetsTypes.UNDEFINED, '0x', ONE_TOKEN)],
        takeAssets: [makeERC721Asset(nft.address, 1)],
      });
      takerOrder = createTakerOrder(taker.address, makerOrder);
    });

    it('reverts', async () => {
      await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner)).revertedWith(
        `UnsupportedAssetClass("${AssetsTypes.UNDEFINED}")`,
      );
    });
  });

  context('when orders are submitted', () => {
    let makerOrder: Orders.OrderStruct;
    let takerOrder: Orders.OrderStruct;
    beforeEach(() => {
      makerOrder = createOrder({
        maker: maker.address,
        makeAssets: [makeERC20Asset(gameToken.address, ONE_TOKEN)],
        takeAssets: [makeERC721Asset(nft.address, 1)],
      });
      takerOrder = createTakerOrder(taker.address, makerOrder);
    });

    context('when left order taker != right order maker', () => {
      beforeEach(() => {
        makerOrder.taker = stranger.address;
      });

      it('reverts', async () => {
        await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner)).revertedWith(
          `OrderTargetVerificationFailed("${taker.address}", "${stranger.address}")`,
        );
      });
    });

    context('when right order maker != left order taker', () => {
      beforeEach(() => {
        takerOrder.taker = stranger.address;
      });

      it('reverts', async () => {
        await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner)).revertedWith(
          `OrderTargetVerificationFailed("${maker.address}", "${stranger.address}")`,
        );
      });
    });

    context('when tried to execute canceled order', () => {
      context('maker order', () => {
        beforeEach(async () => {
          await marketplace.connect(maker).cancel(makerOrder);
        });

        it('reverts', async () => {
          await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner)).revertedWith(
            `OrderAlreadyCompleted("${orderSigner.getOrderKeyHash(makerOrder)}")`,
          );
        });
      });

      context('taker order', () => {
        beforeEach(async () => {
          await marketplace.connect(taker).cancel(takerOrder);
        });

        it('reverts', async () => {
          await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner)).revertedWith(
            `OrderAlreadyCompleted("${orderSigner.getOrderKeyHash(takerOrder)}")`,
          );
        });
      });
    });

    context('when orders are matched', () => {
      beforeEach(async () => {
        await approveAll();
      });
      context('Match event', () => {
        it('emits', async () => {
          await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner))
            .emit(marketplace, 'Match')
            .withArgs(
              orderSigner.getOrderKeyHash(makerOrder),
              orderSigner.getOrderKeyHash(takerOrder),
              maker.address,
              taker.address,
              [], // here should be maker assets, but waffle doesn't support arrays in events
              [], // here should be taker assets, but waffle doesn't support arrays in events
            );
        });
      });

      context('zero salt', () => {
        context('when left order uses zero salt', () => {
          beforeEach(() => {
            makerOrder.salt = 0;
          });

          it('works', async () => {
            await matchOrders(marketplace.connect(maker), makerOrder, maker, takerOrder, taker, orderSigner);

            await expect(marketplace.completedOrders(orderSigner.getOrderKeyHash(makerOrder))).eventually.to.be.false;
            await expect(marketplace.completedOrders(orderSigner.getOrderKeyHash(takerOrder))).eventually.to.be.true;
          });

          it('maker can omit signature', async () => {
            await marketplace
              .connect(maker)
              .matchOrders(makerOrder, '0x', takerOrder, await orderSigner.signOrder(taker, takerOrder), {
                gasLimit: 10_000_000,
              });

            await expect(marketplace.completedOrders(orderSigner.getOrderKeyHash(makerOrder))).eventually.to.be.false;
            await expect(marketplace.completedOrders(orderSigner.getOrderKeyHash(takerOrder))).eventually.to.be.true;
          });
        });

        context('when right order uses zero salt', () => {
          beforeEach(() => {
            takerOrder.salt = 0;
          });

          it('works', async () => {
            await matchOrders(marketplace.connect(taker), makerOrder, maker, takerOrder, taker, orderSigner);

            await expect(marketplace.completedOrders(orderSigner.getOrderKeyHash(makerOrder))).eventually.to.be.true;
            await expect(marketplace.completedOrders(orderSigner.getOrderKeyHash(takerOrder))).eventually.to.be.false;
          });

          it('taker can omit signature', async () => {
            await marketplace
              .connect(taker)
              .matchOrders(makerOrder, await orderSigner.signOrder(maker, makerOrder), takerOrder, '0x', {
                gasLimit: 10_000_000,
              });

            await expect(marketplace.completedOrders(orderSigner.getOrderKeyHash(makerOrder))).eventually.to.be.true;
            await expect(marketplace.completedOrders(orderSigner.getOrderKeyHash(takerOrder))).eventually.to.be.false;
          });
        });
      });
    });

    context('when tries to execute same order', () => {
      beforeEach(async () => {
        await approveAll();
        await matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner);
      });

      context('maker order', () => {
        beforeEach(() => {
          takerOrder.salt = 999;
        });

        it('reverts', async () => {
          await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner)).revertedWith(
            `OrderAlreadyCompleted("${orderSigner.getOrderKeyHash(makerOrder)}")`,
          );
        });
      });

      context('taker order', () => {
        beforeEach(() => {
          makerOrder.salt = 999;
        });

        it('reverts', async () => {
          await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner)).revertedWith(
            `OrderAlreadyCompleted("${orderSigner.getOrderKeyHash(takerOrder)}")`,
          );
        });
      });
    });
  });

  context('when order assets are misaligned', () => {
    let makerOrder: Orders.OrderStruct;
    let takerOrder: Orders.OrderStruct;
    beforeEach(() => {
      makerOrder = createOrder({
        maker: maker.address,
        makeAssets: [makeERC20Asset(gameToken.address, ONE_TOKEN), makeERC721Asset(nft.address, 3)],
        takeAssets: [makeERC721Asset(nft.address, 1), makeERC721Asset(nft.address, 2)],
      });
      takerOrder = createTakerOrder(taker.address, makerOrder);
    });

    context('when left order maker assets are moved', () => {
      beforeEach(() => {
        makerOrder.makeAssets.reverse();
      });

      it('reverts', async () => {
        await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner)).revertedWith(
          `AssetsDoNotMatch()`,
        );
      });
    });

    context('when left order taker assets are moved', () => {
      beforeEach(() => {
        makerOrder.takeAssets.reverse();
      });

      it('reverts', async () => {
        await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner)).revertedWith(
          `AssetsDoNotMatch()`,
        );
      });
    });

    context('when right order maker assets are moved', () => {
      beforeEach(() => {
        takerOrder.makeAssets.reverse();
      });

      it('reverts', async () => {
        await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner)).revertedWith(
          `AssetsDoNotMatch()`,
        );
      });
    });

    context('when right order taker assets are moved', () => {
      beforeEach(() => {
        takerOrder.takeAssets.reverse();
      });

      it('reverts', async () => {
        await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner)).revertedWith(
          `AssetsDoNotMatch()`,
        );
      });
    });

    context('when left order makeAssets does not align with right order takeAssets', () => {
      beforeEach(() => {
        makerOrder.makeAssets = makerOrder.makeAssets.splice(0, 1);
      });

      it('reverts', async () => {
        await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner)).revertedWith(
          `AssetsLengthDoNotMatch(${makerOrder.makeAssets.length}, ${takerOrder.takeAssets.length})`,
        );
      });
    });

    context('when left order takeAssets does not align with right order makeAssets', () => {
      beforeEach(() => {
        makerOrder.takeAssets = makerOrder.takeAssets.splice(0, 1);
      });

      it('reverts', async () => {
        await expect(matchOrders(marketplace, makerOrder, maker, takerOrder, taker, orderSigner)).revertedWith(
          `AssetsLengthDoNotMatch(${takerOrder.makeAssets.length}, ${makerOrder.takeAssets.length})`,
        );
      });
    });
  });

  context('invalid permits', () => {
    let makerOrder: Orders.OrderStruct;
    let takerOrder: Orders.OrderStruct;
    beforeEach(() => {
      makerOrder = createOrder({
        maker: maker.address,
        makeAssets: [makeERC20Asset(gameToken.address, ONE_TOKEN)],
        takeAssets: [makeERC721Asset(nft.address, 1)],
      });
      takerOrder = createTakerOrder(taker.address, makerOrder);
    });

    context('invalid ERC20 permit signature length', () => {
      it('reverts', async () => {
        await expect(
          matchOrdersWithPermits(
            marketplace,
            makerOrder,
            maker,
            takerOrder,
            taker,
            [{ asset: makeERC20Asset(gameToken.address, ONE_TOKEN), deadline: 0, signature: '0x' }],
            [],
            orderSigner,
          ),
        ).revertedWith('InvalidSignatureLength()');
      });
    });

    context('permit for unsupported asset class', () => {
      it('reverts', async () => {
        await expect(
          matchOrdersWithPermits(
            marketplace,
            makerOrder,
            maker,
            takerOrder,
            taker,
            [{ asset: makeAsset(AssetsTypes.UNDEFINED, '0x', 0), deadline: 0, signature: '0x' }],
            [],
            orderSigner,
          ),
        ).revertedWith(`CannotPermitUnsupportedAssetClass("${AssetsTypes.UNDEFINED}")`);
      });
    });

    context('when sender permit', () => {
      context('wrong asset class', () => {
        it('reverts', async () => {
          await expect(
            matchOrdersWithPermitsAndSenderPermit(
              marketplace,
              makerOrder,
              maker,
              takerOrder,
              taker,
              [],
              [],
              { asset: makeAsset(AssetsTypes.UNDEFINED, '0x', 0), deadline: 0, signature: '0x' },
              orderSigner,
            ),
          ).revertedWith(`UnexpectedSenderPermitAssetClass("${AssetsTypes.ERC20}", "${AssetsTypes.UNDEFINED}")`);
        });
      });

      context('wrong ERC20 token', () => {
        it('reverts', async () => {
          await expect(
            matchOrdersWithPermitsAndSenderPermit(
              marketplace,
              makerOrder,
              maker,
              takerOrder,
              taker,
              [],
              [],
              { asset: makeERC20Asset(mockToken.address, ONE_TOKEN), deadline: 0, signature: '0x' },
              orderSigner,
            ),
          ).revertedWith(`UnsupportedERC20Token("${mockToken.address}")`);
        });
      });
    });
  });

  async function approveAll() {
    await nft.connect(taker).setApprovalForAll(marketplace.address, true);
    await nft.connect(maker).setApprovalForAll(marketplace.address, true);
    await gameToken.approve(marketplace.address, ONE_TOKEN * 1_000n); // for paying fees
    await gameToken.connect(maker).approve(marketplace.address, ONE_TOKEN * 1_000n);
    await gameToken.connect(taker).approve(marketplace.address, ONE_TOKEN * 1_000n);
  }
}
