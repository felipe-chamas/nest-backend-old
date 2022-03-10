import { baseContext } from './shared/context';
import { unitTestACL } from './unit/acl/acl.test';
import { unitTestGameToken } from './unit/game-token/game-token.test';
import { unitTestNFT } from './unit/nft/nft.test';

baseContext('Unit Tests', function () {
  unitTestACL();
  unitTestGameToken();
  unitTestNFT();
});
