import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { GameToken, MarketplaceMock, NFT } from '../../../../../typechain';
import { Orders } from '../../../../../typechain/contracts/marketplace/Marketplace';
import { ONE_TOKEN } from '../../../../shared/constants';
import { OrderSigner } from '../../../../shared/utils';
import { createOrder, makeERC20Asset, makeERC721Asset } from '../../marketplace.utils';

export function shouldBehaveLikeMarketplaceOrderHashing() {
  let marketplace: MarketplaceMock;
  let gameToken: GameToken;
  let nft: NFT;
  let user: SignerWithAddress;
  let orderSigner: OrderSigner;
  let order: Orders.OrderStruct;

  beforeEach(function () {
    ({ user } = this.signers);
    ({ nft, gameToken, marketplace } = this.contracts);
    orderSigner = new OrderSigner(this.chainId, marketplace.address);
    order = createOrder({
      maker: user.address,
      makeAssets: [makeERC20Asset(gameToken.address, ONE_TOKEN)],
      takeAssets: [makeERC721Asset(nft.address, 1)],
    });
  });

  it('returns EIP712 order hash', async () => {
    await expect(marketplace.getOrderHash(order)).eventually.to.eq(orderSigner.getOrderHash(order));
  });
}
