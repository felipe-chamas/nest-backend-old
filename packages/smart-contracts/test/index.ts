import { baseContext } from './shared/context';
import { shouldBehaveLikeGameToken } from './unit/game-token.test';

baseContext('Unit Tests', function () {
  shouldBehaveLikeGameToken();
});
