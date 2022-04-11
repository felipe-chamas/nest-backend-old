import { Signer } from 'ethers';
import { ERC20TokenRecoverable__factory } from '../../../typechain';
import { AccessControllable__factory } from '../../../typechain/factories/AccessControllable__factory';
import { ONE_TOKEN } from '../../shared/constants';
import {
  deployACL,
  deployMockERC20,
  deployNFTBox,
  deployNFTUnboxing,
  deployVRFCoordinatorV2,
} from '../../shared/deployers';
import { getSubscriptionCreatedEvent } from '../../shared/utils';
import { shouldBehaveLikeAccessControllable } from '../access-controllable/access-controllable.behavior';
import { shouldBehaveLikeERC20TokenRecoverable } from '../recoverable/recoverable.behavior';
import { NFT_BOX_BASE_URI, shouldBehaveLikeNFTUnboxing } from './nft-unboxing.behavior';

async function nftUnboxingFixture(signers: Signer[]) {
  const [deployer, operator] = signers;
  const [deployerAddress, operatorAddress] = await Promise.all([deployer.getAddress(), operator.getAddress()]);

  const acl = await deployACL(deployer, { admin: deployerAddress, operator: operatorAddress });
  const nftBox = await deployNFTBox(deployer, { acl: acl.address, baseUri: NFT_BOX_BASE_URI });
  const coordinator = await deployVRFCoordinatorV2(deployer);

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

  return {
    acl,
    nftBox,
    nftUnboxing,
    mockToken: await deployMockERC20(deployer, {}),
  };
}

export function unitTestNFTUnboxing(): void {
  describe('NFT Box', function () {
    beforeEach(async function () {
      const { acl, nftBox, nftUnboxing, mockToken } = await this.loadFixture(nftUnboxingFixture);

      this.contracts.acl = acl;
      this.contracts.nftBox = nftBox;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(nftUnboxing.address, this.signers.admin);
      this.contracts.accessControllable = AccessControllable__factory.connect(nftUnboxing.address, this.signers.admin);
      this.contracts.mockToken = mockToken;
    });

    shouldBehaveLikeNFTUnboxing();
    shouldBehaveLikeERC20TokenRecoverable();
    shouldBehaveLikeAccessControllable();
  });
}
