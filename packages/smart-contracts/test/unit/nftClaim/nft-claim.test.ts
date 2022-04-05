import { Signer } from 'ethers';
import { ERC20TokenRecoverable__factory } from '../../../typechain';
import { deployACL, deployNFT, deployNFTClaim } from '../../shared/deployers';
import { shouldBehaveLikeERC20TokenRecoverable } from '../recoverable/recoverable.behavior';
import { shouldBehaveLikeNFTClaim } from './nft-claim.behavior';

async function nftClaimFixture(signers: Signer[], operatorRole: string) {
  const [deployer, operator] = signers;

  const [deployerAddress, operatorAddress] = await Promise.all([deployer.getAddress(), operator.getAddress()]);

  const acl = await deployACL(deployer, { admin: deployerAddress, operator: operatorAddress });
  const nft = await deployNFT(deployer, { acl: acl.address });
  const nftClaim = await deployNFTClaim(deployer, { acl: acl.address, nft: nft.address });

  await acl.grantRole(operatorRole, nftClaim.address);

  return {
    acl,
    nft,
    nftClaim,
  };
}

export function unitTestNFTClaim(): void {
  describe('NFT Claim', function () {
    const fixture = (signers: Signer[]) => nftClaimFixture(signers, this.ctx.roles['OPERATOR_ROLE']);
    beforeEach(async function () {
      const { acl, nft, nftClaim } = await this.loadFixture(fixture);

      this.contracts.acl = acl;
      this.contracts.nft = nft;
      this.contracts.nftClaim = nftClaim;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(nftClaim.address, this.signers.admin);
    });

    describe('NFT Claim', function () {
      shouldBehaveLikeNFTClaim();
    });

    describe('ERC20 Token Recoverable', function () {
      shouldBehaveLikeERC20TokenRecoverable();
    });
  });
}
