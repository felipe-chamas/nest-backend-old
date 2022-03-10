import { ethers } from 'hardhat';
import { ACL, ERC20Mock, ERC20TokenRecoverable__factory, GameToken } from '../../../typechain';
import { deployACL, deployGameToken, deployMockERC20 } from '../../shared/deployers';
import { shouldBehaveLikeERC20TokenRecoverable } from '../recoverable/recoverable.behavior';
import { shouldBehaveLikeGameToken } from './game-token.behavior';

async function gameTokenFixture(): Promise<{ gameToken: GameToken; mockToken: ERC20Mock; acl: ACL }> {
  const [deployer] = await ethers.getSigners();
  const acl = await deployACL(deployer, deployer.address, deployer.address);

  return {
    acl,
    gameToken: await deployGameToken(deployer, deployer.address, acl.address),
    mockToken: await deployMockERC20(deployer),
  };
}

export function unitTestGameToken(): void {
  describe('Game Token', function () {
    beforeEach(async function () {
      const { gameToken, mockToken } = await this.loadFixture(gameTokenFixture);
      this.contracts.mockToken = mockToken;
      this.contracts.gameToken = gameToken;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(gameToken.address, this.signers.admin);
    });

    shouldBehaveLikeGameToken();
    shouldBehaveLikeERC20TokenRecoverable();
  });
}
