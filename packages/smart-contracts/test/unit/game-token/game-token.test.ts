import { Signer } from 'ethers';
import {
  AccessControllable__factory,
  ACL,
  ERC20Mock,
  ERC20TokenRecoverable__factory,
  GameToken,
} from '../../../typechain';
import { deployACL, deployGameToken, deployMockERC20 } from '../../shared/deployers';
import { shouldBehaveLikeAccessControllable } from '../access-controllable/access-controllable.behavior';
import { shouldBehaveLikeERC20TokenRecoverable } from '../recoverable/recoverable.behavior';
import { shouldBehaveLikeGameToken } from './game-token.behavior';

async function gameTokenFixture(signers: Signer[]): Promise<{ gameToken: GameToken; mockToken: ERC20Mock; acl: ACL }> {
  const [deployer, operator] = signers;
  const [deployerAddress, operatorAddress] = await Promise.all([deployer.getAddress(), operator.getAddress()]);

  const acl = await deployACL(deployer, { admin: deployerAddress, operator: operatorAddress, silent: true });

  return {
    acl,
    gameToken: await deployGameToken(deployer, { admin: deployerAddress, acl: acl.address, silent: true }),
    mockToken: await deployMockERC20(deployer, {}),
  };
}

export function unitTestGameToken(): void {
  describe('Game Token', function () {
    beforeEach(async function () {
      const { gameToken, mockToken, acl } = await this.loadFixture(gameTokenFixture);
      this.contracts.acl = acl;
      this.contracts.mockToken = mockToken;
      this.contracts.gameToken = gameToken;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(gameToken.address, this.signers.admin);
      this.contracts.accessControllable = AccessControllable__factory.connect(gameToken.address, this.signers.admin);
    });

    shouldBehaveLikeGameToken();
    shouldBehaveLikeERC20TokenRecoverable();
    shouldBehaveLikeAccessControllable();
  });
}
