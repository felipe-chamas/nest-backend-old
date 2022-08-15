import { Signer } from 'ethers';
import { AccessControllable__factory, ERC20TokenRecoverable__factory } from '../../../typechain';
import { deployACL, deployMockERC20, deployNFT, deployNFTUnboxing } from '../../shared/deployers';
import { Roles } from '../../shared/types';
import { shouldBehaveLikeAccessControllable } from '../access-controllable/access-controllable.behavior';
import { shouldBehaveLikeERC20TokenRecoverable } from '../recoverable/recoverable.behavior';
import { shouldBehaveLikeNFTUnboxing } from './nft-unboxing.behavior';

async function nftUnboxingFixture(signers: Signer[]) {
  const [deployer, operator] = signers;
  const [deployerAddress, operatorAddress] = await Promise.all([deployer.getAddress(), operator.getAddress()]);

  const acl = await deployACL(deployer, { admin: deployerAddress, operator: operatorAddress, silent: true });
  const bananas = await deployNFT(deployer, { acl: acl.address, name: 'BANANA', symbol: 'BAN', silent: true });
  const lemons = await deployNFT(deployer, { acl: acl.address, name: 'LEMON', symbol: 'LEM', silent: true });
  const nftBox = await deployNFT(deployer, {
    acl: acl.address,
    name: 'BOX',
    symbol: 'BOX',
    silent: true,
    burnEnabled: true,
  });

  await acl.grantRole(Roles.MINTER_ROLE, operatorAddress);

  const nftUnboxing = await deployNFTUnboxing(deployer, {
    acl: acl.address,
    nftBox: nftBox.address,
    silent: true,
  });

  await acl.grantRole(Roles.MINTER_ROLE, nftUnboxing.address);

  return {
    acl,
    nftBox,
    nftUnboxing,
    bananas,
    lemons,
    mockToken: await deployMockERC20(deployer, {}),
  };
}

export function unitTestNFTUnboxing(): void {
  describe('NFT Box', function () {
    beforeEach(async function () {
      const { acl, nftBox, nftUnboxing, mockToken, bananas, lemons } = await this.loadFixture(nftUnboxingFixture);

      this.contracts.acl = acl;
      this.contracts.nft = nftBox;
      this.contracts.nftUnboxing = nftUnboxing;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(nftUnboxing.address, this.signers.admin);
      this.contracts.accessControllable = AccessControllable__factory.connect(nftUnboxing.address, this.signers.admin);
      this.contracts.mockToken = mockToken;
      this.contracts.collection = [bananas, lemons];
    });

    shouldBehaveLikeNFTUnboxing();
    shouldBehaveLikeERC20TokenRecoverable();
    shouldBehaveLikeAccessControllable();
  });
}
