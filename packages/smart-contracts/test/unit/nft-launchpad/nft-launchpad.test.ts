import { Signer } from 'ethers';
import { deployACL, deployNFTLaunchpad } from '../../shared/deployers';
import { Roles } from '../../shared/types';
import {
  shouldBehaveLikeNFT,
  shouldBehaveLikeNFTWithBatchTransfer,
  shouldBehaveLikeNFTWithLimitedSupply,
} from '../nft/nft.behavior';
import { shouldBehaveLikeConstructor } from './constructor';
import { shouldBehaveLikeINFTLaunchpad, shouldBehaveLikeOnlyLaunchpadIsAllowedToMint } from './nft-launchpad.behavior';

async function nftLaunchpadFixture(signers: Signer[], burnEnabled: boolean, maxTokenSupply: string) {
  const [deployer, operator, launchpad] = signers;
  const [deployerAddress, operatorAddress, launchpadAddress] = await Promise.all([
    deployer.getAddress(),
    operator.getAddress(),
    launchpad.getAddress(),
  ]);

  const acl = await deployACL(deployer, { admin: deployerAddress, operator: operatorAddress, silent: true });
  await acl.grantRole(Roles.MINTER_ROLE, operatorAddress);

  const nftLaunchpad = await deployNFTLaunchpad(deployer, {
    acl: acl.address,
    maxTokenSupply,
    burnEnabled,
    silent: true,
    launchpad: launchpadAddress,
  });

  return {
    acl,
    nftLaunchpad,
  };
}

export function unitTestNFTLaunchpad(): void {
  describe('NFT Launchpad', function () {
    const burnEnabled = true;
    const maxTokenSupply = 6n;
    const fixture = (signers: Signer[]) => nftLaunchpadFixture(signers, burnEnabled, maxTokenSupply.toString());
    beforeEach(async function () {
      const { acl, nftLaunchpad } = await this.loadFixture(fixture);

      this.contracts.acl = acl;
      this.contracts.nftLaunchpad = nftLaunchpad;
    });

    shouldBehaveLikeConstructor();
    shouldBehaveLikeNFT(true, 'nftLaunchpad');
    shouldBehaveLikeNFTWithLimitedSupply(maxTokenSupply, 'nftLaunchpad');
    shouldBehaveLikeNFTWithBatchTransfer('nftLaunchpad');
    shouldBehaveLikeINFTLaunchpad(maxTokenSupply);
    shouldBehaveLikeOnlyLaunchpadIsAllowedToMint();
  });
}
