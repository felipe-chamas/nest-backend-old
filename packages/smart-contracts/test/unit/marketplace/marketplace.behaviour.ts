import { shouldBehaveLikeConstructor } from './deployment/constructor';
import { shouldBehaveLikeMarketplaceOrders } from './effects/orders';
import { shouldBehaveLikeMarketplacePauseable } from './effects/pauseable';
import { shouldBehaveLikeMarketplaceSetters } from './effects/setters';
import { shouldBehaveLikeMarketplaceGameTokenGetter } from './view/game-token';

export function shouldBehaveLikeMarketplace() {
  context('Marketplace', function () {
    context('constructor', () => {
      shouldBehaveLikeConstructor();
    });

    context('Setters', () => {
      shouldBehaveLikeMarketplaceSetters();
    });

    context('Pauseable', () => {
      shouldBehaveLikeMarketplacePauseable();
    });

    context('Getters', () => {
      shouldBehaveLikeMarketplaceGameTokenGetter();
    });

    context('Orders', () => {
      shouldBehaveLikeMarketplaceOrders();
    });
  });
}
