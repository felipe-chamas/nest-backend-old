import { baseContext } from './shared/context';
import { unitTestGameToken } from './unit/game-token.test';

baseContext('Unit Tests', function () {
  unitTestGameToken();
});
