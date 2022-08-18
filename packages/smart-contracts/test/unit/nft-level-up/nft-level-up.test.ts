import { Signer } from 'ethers';
import { AccessControllable__factory, ERC20TokenRecoverable__factory } from '../../../typechain';
import { ONE_TOKEN } from '../../shared/constants';
import { deployACL, deployMockERC20, deployNFT, deployNFTLevelUp } from '../../shared/deployers';
import { Roles } from '../../shared/types';
import { shouldBehaveLikeAccessControllable } from '../access-controllable/access-controllable.behavior';
import { shouldBehaveLikeERC20TokenRecoverable } from '../recoverable/recoverable.behavior';
import { shouldBehaveLikeNFTLevelUp } from './nft-level-up.behavior';

async function nftLevelUpFixture(signers: Signer[], levelUpValue: string) {
  const [deployer, operator] = signers;
  const [deployerAddress, operatorAddress] = await Promise.all([deployer.getAddress(), operator.getAddress()]);

  const acl = await deployACL(deployer, { admin: deployerAddress, operator: operatorAddress, silent: true });

  const nft = await deployNFT(deployer, {
    acl: acl.address,
    name: 'NFT',
    symbol: 'NFT',
    silent: true,
    burnEnabled: true,
  });

  await acl.grantRole(Roles.ADMIN_ROLE, deployerAddress);
  await acl.grantRole(Roles.MINTER_ROLE, operatorAddress);

  const nftLevelUp = await deployNFTLevelUp(deployer, {
    acl: acl.address,
    levelUpValue,
    receiver: deployerAddress,
    silent: true,
  });

  await acl.grantRole(Roles.MINTER_ROLE, nftLevelUp.address);

  return {
    acl,
    nft,
    nftLevelUp,
    mockToken: await deployMockERC20(deployer, {}),
  };
}

export function unitTestNFTLevelUp(): void {
  describe('NFT Box', function () {
    const LEVEL_UP_VALUE = (ONE_TOKEN * 2n) / 10n;
    const fixture = (signers: Signer[]) => nftLevelUpFixture(signers, LEVEL_UP_VALUE.toString());

    beforeEach(async function () {
      const { acl, nft, nftLevelUp, mockToken } = await this.loadFixture(fixture);

      this.contracts.acl = acl;
      this.contracts.nft = nft;
      this.contracts.nftLevelUp = nftLevelUp;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(nftLevelUp.address, this.signers.admin);
      this.contracts.accessControllable = AccessControllable__factory.connect(nftLevelUp.address, this.signers.admin);
      this.contracts.mockToken = mockToken;
    });

    shouldBehaveLikeNFTLevelUp(LEVEL_UP_VALUE);
    shouldBehaveLikeERC20TokenRecoverable();
    shouldBehaveLikeAccessControllable();
  });
}
