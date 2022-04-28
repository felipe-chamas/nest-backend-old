import { Signer } from 'ethers';
import { AccessControllable__factory, ERC20TokenRecoverable__factory } from '../../../typechain';
import { deployACL, deployNFT, deployNFTClaim } from '../../shared/deployers';
import { Roles } from '../../shared/types';
import { shouldBehaveLikeAccessControllable } from '../access-controllable/access-controllable.behavior';
import { shouldBehaveLikeERC20TokenRecoverable } from '../recoverable/recoverable.behavior';
import { shouldBehaveLikeNFTClaim } from './nft-claim.behavior';

async function nftClaimFixture(signers: Signer[]) {
  const [deployer, operator] = signers;

  const [deployerAddress, operatorAddress] = await Promise.all([deployer.getAddress(), operator.getAddress()]);

  const acl = await deployACL(deployer, { admin: deployerAddress, operator: operatorAddress, silent: true });
  const nft = await deployNFT(deployer, { acl: acl.address, silent: true });
  const nftClaim = await deployNFTClaim(deployer, { acl: acl.address, nft: nft.address, silent: true });

  await acl.grantRole(Roles.MINTER_ROLE, nftClaim.address);

  return {
    acl,
    nft,
    nftClaim,
  };
}

export function unitTestNFTClaim(): void {
  describe('NFT Claim', function () {
    beforeEach(async function () {
      const { acl, nft, nftClaim } = await this.loadFixture(nftClaimFixture);

      this.contracts.acl = acl;
      this.contracts.nft = nft;
      this.contracts.nftClaim = nftClaim;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(nftClaim.address, this.signers.admin);
      this.contracts.accessControllable = AccessControllable__factory.connect(nftClaim.address, this.signers.admin);
    });

    describe('NFT Claim', function () {
      shouldBehaveLikeNFTClaim();
    });

    describe('Access Controllable', function () {
      shouldBehaveLikeAccessControllable();
    });

    describe('ERC20 Token Recoverable', function () {
      shouldBehaveLikeERC20TokenRecoverable();
    });
  });
}
