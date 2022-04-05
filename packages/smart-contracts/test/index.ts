import { baseContext } from './shared/context';
import { unitTestACL } from './unit/acl/acl.test';
import { unitTestGameToken } from './unit/game-token/game-token.test';
import { unitTestNFTBox } from './unit/nft-box/nftBox.test';
import { unitTestNFT } from './unit/nft/nft.test';
import { unitTestNFTClaim } from './unit/nftClaim/nft-claim.test';
import { unitTestTokenSale } from './unit/token-sale/token-sale.test';

baseContext('Unit Tests', function () {
  unitTestACL();
  unitTestGameToken();
  unitTestNFT();
  unitTestTokenSale();
  unitTestNFTBox();

  unitTestNFTClaim();
});
