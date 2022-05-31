import { Signer } from 'ethers';
import { deployACL, deployGameToken, deployNFT, deployStaking } from '../../shared/deployers';
import { Roles } from '../../shared/types';
import { shouldBehaveLikeStaking } from './staking.behavior';

async function stakingFixture(signers: Signer[], custody: string) {
  const [deployer, operator] = signers;

  const [deployerAddress, operatorAddress] = await Promise.all([deployer.getAddress(), operator.getAddress()]);

  const acl = await deployACL(deployer, { admin: deployerAddress, operator: operatorAddress, silent: true });
  const gameToken = await deployGameToken(deployer, { acl: acl.address, admin: deployerAddress });
  const nftStake = await deployNFT(deployer, { acl: acl.address, burnEnabled: true, silent: true });
  const staking = await deployStaking(deployer, {
    nftStake: nftStake.address,
    tokenContract: gameToken.address,
    custody,
    acl: acl.address,
    silent: false,
  });

  await acl.grantRole(Roles.MINTER_ROLE, staking.address);

  return {
    staking,
    nftStake,
    gameToken,
    acl,
  };
}

export function unitTestStaking(): void {
  describe.only('Staking', function () {
    const fixture = (signers: Signer[]) => stakingFixture(signers, this.ctx.signers.custody.address);
    beforeEach(async function () {
      const { staking, gameToken, acl, nftStake } = await this.loadFixture(fixture);

      this.contracts.acl = acl;
      this.contracts.gameToken = gameToken;
      this.contracts.nft = nftStake;
      this.contracts.staking = staking;
    });

    shouldBehaveLikeStaking();
  });
}
