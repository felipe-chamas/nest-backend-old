import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { GameToken, MarketplaceMock, NFT } from '../../../../../typechain';
import { Orders } from '../../../../../typechain/contracts/marketplace/Marketplace';
import { ONE_TOKEN } from '../../../../shared/constants';
import { OrderSigner } from '../../../../shared/utils';
import { createOrder, makeERC20Asset, makeERC721Asset } from '../../marketplace.utils';

export function shouldBehaveLikeMarketplaceOrderCancel() {
  let marketplace: MarketplaceMock;
  let gameToken: GameToken;
  let nft: NFT;
  let user: SignerWithAddress;
  let stranger: SignerWithAddress;
  let operator: SignerWithAddress;
  let orderSigner: OrderSigner;
  let order: Orders.OrderStruct;

  beforeEach(function () {
    ({ user, stranger, operator } = this.signers);
    ({ nft, gameToken, marketplace } = this.contracts);
    orderSigner = new OrderSigner(this.chainId, marketplace.address);
    order = createOrder({
      maker: user.address,
      makeAssets: [makeERC20Asset(gameToken.address, ONE_TOKEN)],
      takeAssets: [makeERC721Asset(nft.address, 1)],
    });
  });

  context('when user cancels the order', () => {
    it('works', async () => {
      await expect(marketplace.connect(user).cancel(order))
        .to.emit(marketplace, 'Cancel')
        .withArgs(orderSigner.getOrderKeyHash(order), order.maker, [], []); // Waffle fails to compare arrays in event args

      await expect(marketplace.completedOrders(orderSigner.getOrderKeyHash(order))).eventually.to.be.true;
    });
  });

  context('when user cancels order with zero salt', () => {
    beforeEach(() => {
      order.salt = 0;
    });
    it('reverts', async () => {
      await expect(marketplace.connect(user).cancel(order)).revertedWith(`ZeroSaltCannotBeUsed()`);
    });
  });

  context('when stranger cancels the order', () => {
    it('reverts', async () => {
      await expect(marketplace.connect(stranger).cancel(order)).revertedWith(`MsgSenderIsNotOrderMaker()`);
    });
  });

  context('when operator calls pause() on Marketplace', () => {
    beforeEach(async () => {
      await marketplace.connect(operator).pause();
    });

    it('is possible to cancel order', async () => {
      await marketplace.connect(user).cancel(order);

      await expect(marketplace.completedOrders(orderSigner.getOrderKeyHash(order))).eventually.to.be.true;
    });
  });
}
