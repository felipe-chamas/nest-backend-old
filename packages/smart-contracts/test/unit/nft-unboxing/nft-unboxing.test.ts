import { Signer } from 'ethers';
import { ERC20TokenRecoverable__factory } from '../../../typechain';
import { AccessControllable__factory } from '../../../typechain/factories/AccessControllable__factory';
import { ONE_TOKEN } from '../../shared/constants';
import {
  deployACL,
  deployMockERC20,
  deployNFT,
  deployNFTBox,
  deployNFTUnboxing,
  deployVRFCoordinatorV2,
} from '../../shared/deployers';
import { Roles } from '../../shared/types';
import { getSubscriptionCreatedEvent } from '../../shared/utils';
import { shouldBehaveLikeAccessControllable } from '../access-controllable/access-controllable.behavior';
import { shouldBehaveLikeERC20TokenRecoverable } from '../recoverable/recoverable.behavior';
import { NFT_BOX_BASE_URI, shouldBehaveLikeNFTUnboxing } from './nft-unboxing.behavior';

async function nftUnboxingFixture(signers: Signer[]) {
  const [deployer, operator] = signers;
  const [deployerAddress, operatorAddress] = await Promise.all([deployer.getAddress(), operator.getAddress()]);

  const acl = await deployACL(deployer, { admin: deployerAddress, operator: operatorAddress });
  const bananas = await deployNFT(deployer, { acl: acl.address, name: 'BANANA', symbol: 'BAN' });
  const lemons = await deployNFT(deployer, { acl: acl.address, name: 'LEMON', symbol: 'LEM' });
  const nftBox = await deployNFTBox(deployer, { acl: acl.address, baseUri: NFT_BOX_BASE_URI });
  const coordinator = await deployVRFCoordinatorV2(deployer);

  await acl.grantRole(Roles.MINTER_ROLE, operatorAddress);

  const { subId } = await getSubscriptionCreatedEvent(await coordinator.createSubscription(), coordinator);

  await coordinator.fundSubscription(subId, ONE_TOKEN * 100n);

  const nftUnboxing = await deployNFTUnboxing(deployer, {
    acl: acl.address,
    nftBox: nftBox.address,
    vrfCoordinator: coordinator.address,
    requestConfirmations: 3,
    subscriptionId: subId.toString(),
    keyHash: '0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314',
  });

  await acl.grantRole(Roles.MINTER_ROLE, nftUnboxing.address);

  return {
    acl,
    nftBox,
    nftUnboxing,
    coordinator,
    bananas,
    lemons,
    mockToken: await deployMockERC20(deployer, {}),
  };
}

export function unitTestNFTUnboxing(): void {
  describe('NFT Box', function () {
    beforeEach(async function () {
      const { acl, nftBox, nftUnboxing, mockToken, coordinator, bananas, lemons } = await this.loadFixture(
        nftUnboxingFixture,
      );

      this.contracts.acl = acl;
      this.contracts.nftBox = nftBox;
      this.contracts.nftUnboxing = nftUnboxing;
      this.contracts.vrfCoordinator = coordinator;
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
