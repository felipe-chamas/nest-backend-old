import { shouldBehaveLikeMarketplaceOrderCancel } from './orders/cancel';
import { shouldBehaveLikeMarketplaceOrderFees } from '../view/fees';
import { shouldBehaveLikeMarketplaceOrderHashing } from './orders/hashing';
import { shouldBehaveLikeMarketplaceOrderMatching as shouldBehaveLikeMarketplaceOrderExecution } from './orders/execution';
import { shouldBehaveLikeMarketplaceOrderValidation } from './orders/validation';

export function shouldBehaveLikeMarketplaceOrders() {
  context('Order hashing', () => {
    shouldBehaveLikeMarketplaceOrderHashing();
  });

  context('Cancel order', () => {
    shouldBehaveLikeMarketplaceOrderCancel();
  });

  context('Order fees', () => {
    shouldBehaveLikeMarketplaceOrderFees();
  });

  context('Order validation', () => {
    shouldBehaveLikeMarketplaceOrderValidation();
  });

  context('Order execution', () => {
    shouldBehaveLikeMarketplaceOrderExecution();
  });
}
