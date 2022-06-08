import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { GameToken, NFT, OrderValidatorMock } from '../../../../../typechain';
import { Orders } from '../../../../../typechain/Marketplace';
import { AddressZero, ONE_TOKEN } from '../../../../shared/constants';
import { currentTime, OrderSigner } from '../../../../shared/utils';
import { createOrder, createTakerOrder, makeERC20Asset, makeERC721Asset } from '../../marketplace.utils';

export function shouldBehaveLikeMarketplaceOrderValidation() {
  let validator: OrderValidatorMock;
  let gameToken: GameToken;
  let nft: NFT;
  let maker: SignerWithAddress;
  let taker: SignerWithAddress;
  let executor: SignerWithAddress;
  let orderSigner: OrderSigner;
  let order: Orders.OrderStruct;
  let now: number;

  beforeEach(async function () {
    ({ user: maker, other: taker, stranger: executor } = this.signers);
    ({ nft, gameToken, orderValidatorMock: validator } = this.contracts);

    // We get the chain id from the contract because Ganache (used for coverage) does not return the same chain id
    // from within the EVM as from the JSON RPC interface.
    // See https://github.com/trufflesuite/ganache-core/issues/515
    const chainId = await validator.getChainId();

    orderSigner = new OrderSigner(chainId, validator.address);
    now = await currentTime();
    order = createOrder({
      maker: maker.address,
      start: now,
      end: now + 86400,
      makeAssets: [makeERC20Asset(gameToken.address, ONE_TOKEN)],
      takeAssets: [makeERC721Asset(nft.address, 1)],
    });
  });

  context('Order validation', () => {
    context('Timing', () => {
      context('when order start time is in future', () => {
        it('reverts', async () => {
          order.start = now + 100;

          await expect(validator.validateTimestamp(order)).revertedWith(`OrderStartValidationFailed()`);
        });
      });

      context('when order end time is in past', () => {
        it('reverts', async () => {
          order.start = now - 100;
          order.end = now - 10;

          await expect(validator.validateTimestamp(order)).revertedWith(`OrderEndValidationFailed()`);
        });
      });
    });

    context('Signature', () => {
      context('when salt is zero', () => {
        beforeEach(() => {
          order.salt = 0;
        });

        context('when maker is zero address', () => {
          beforeEach(() => {
            order.maker = AddressZero;
          });

          it('works', async () => {
            await validator.validateSignature(order, '0x');
          });
        });

        context('when maker is sender', () => {
          it('works', async () => {
            await validator.connect(maker).validateSignature(order, '0x');
          });
        });

        context('when maker is not sender', () => {
          it('reverts', async () => {
            await expect(validator.connect(executor).validateSignature(order, '0x')).revertedWith(
              `MakerIsNotTxSender()`,
            );
          });
        });
      });

      context('when maker is sender', () => {
        it('works', async () => {
          await validator.connect(maker).validateSignature(order, '0x');
        });
      });

      context('when signature is not valid', () => {
        it('reverts', async () => {
          await expect(validator.connect(executor).validateSignature(order, '0x')).revertedWith(
            'OrderSignatureVerificationFailed()',
          );
        });
      });

      context('when signature is valid', () => {
        let signature: string;

        beforeEach(async () => {
          signature = await orderSigner.signOrder(maker, order);
        });

        it('works', async () => {
          await validator.connect(executor).validateSignature(order, signature);
        });
      });

      context('when taker signature is valid', () => {
        let signature: string;
        let takerOrder: Orders.OrderStruct;
        beforeEach(async () => {
          takerOrder = createTakerOrder(taker.address, order);
          signature = await orderSigner.signOrder(taker, takerOrder);
        });

        it('works', async () => {
          await validator.connect(executor).validateSignature(takerOrder, signature);
        });
      });
    });
  });
}
