import { baseContext } from './shared/context';
import { unitTestACL } from './unit/acl/acl.test';
import { unitTestGameToken } from './unit/game-token/game-token.test';
import { unitTestMarketplace } from './unit/marketplace/marketplace.test';
import { unitTestNFTUnboxing } from './unit/nft-unboxing/nft-unboxing.test';
import { unitTestNFT } from './unit/nft/nft.test';
import { unitTestNFTLaunchpad } from './unit/nft-launchpad/nft-launchpad.test';
import { unitTestNFTClaim } from './unit/nft-claim/nft-claim.test';
import { unitTestTokenSale } from './unit/token-sale/token-sale.test';
import { unitTestSplitter } from './unit/splitter/splitter.test';
import { unitTestStaking } from './unit/staking/staking.test';
import { unitTestNFTLevelUp } from './unit/nft-level-up/nft-level-up.test';

baseContext('Unit Tests', function () {
  unitTestACL();
  unitTestGameToken();
  unitTestNFT();
  unitTestNFTLaunchpad();
  unitTestTokenSale();
  unitTestNFTClaim();
  unitTestNFTUnboxing();
  unitTestSplitter();
  unitTestStaking();
  unitTestMarketplace();
  unitTestNFTLevelUp();
});
