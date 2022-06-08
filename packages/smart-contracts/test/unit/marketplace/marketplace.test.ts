import { Signer } from 'ethers';
import { AccessControllable__factory, ERC20TokenRecoverable__factory } from '../../../typechain';
import {
  deployACL,
  deployGameToken,
  deployMarketplace,
  deployMockERC20,
  deployNFT,
  deployOrderValidatorMock,
} from '../../shared/deployers';
import { Roles } from '../../shared/types';
import { shouldBehaveLikeAccessControllable } from '../access-controllable/access-controllable.behavior';
import { shouldBehaveLikeERC20TokenRecoverable } from '../recoverable/recoverable.behavior';
import { shouldBehaveLikeMarketplace } from './marketplace.behaviour';
import { MARKETPLACE_ERC20_FEE, MARKETPLACE_NFT_FEE } from './marketplace.utils';

async function marketplaceFixture(signers: Signer[], custody: string) {
  const [deployer, operator] = signers;
  const [deployerAddress, operatorAddress] = await Promise.all([deployer.getAddress(), operator.getAddress()]);

  const acl = await deployACL(deployer, { admin: deployerAddress, operator: operatorAddress });
  await acl.grantRole(Roles.MINTER_ROLE, operatorAddress);

  const gameToken = await deployGameToken(deployer, { acl: acl.address, admin: deployerAddress });
  const orderValidator = await deployOrderValidatorMock(deployer, { acl: acl.address });
  const marketplace = await deployMarketplace(deployer, {
    acl: acl.address,
    gameToken: gameToken.address,
    custody,
    erc20FeePercent: MARKETPLACE_ERC20_FEE,
    nftFee: MARKETPLACE_NFT_FEE,
  });

  return {
    acl,
    nft: await deployNFT(deployer, { acl: acl.address }),
    gameToken,
    mockToken: await deployMockERC20(deployer, {}),
    marketplace,
    orderValidator,
  };
}

export function unitTestMarketplace(): void {
  describe('Marketplace', function () {
    const fixture = (signers: Signer[]) => marketplaceFixture(signers, this.ctx.signers.custody.address);
    beforeEach(async function () {
      const { acl, nft, mockToken, gameToken, marketplace, orderValidator } = await this.loadFixture(fixture);

      this.contracts.acl = acl;
      this.contracts.nft = nft;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(marketplace.address, this.signers.admin);
      this.contracts.accessControllable = AccessControllable__factory.connect(marketplace.address, this.signers.admin);
      this.contracts.mockToken = mockToken;
      this.contracts.gameToken = gameToken;
      this.contracts.marketplace = marketplace;
      this.contracts.orderValidatorMock = orderValidator;
    });

    shouldBehaveLikeMarketplace();
    shouldBehaveLikeERC20TokenRecoverable();
    shouldBehaveLikeAccessControllable();
  });
}
