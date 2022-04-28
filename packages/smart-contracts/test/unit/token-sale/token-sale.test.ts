import { Signer } from 'ethers';
import { AccessControllable__factory, ERC20TokenRecoverable__factory } from '../../../typechain';
import { deployACL, deployGameToken, deployMockERC20, deployTokenSale } from '../../shared/deployers';
import { deployGodModeTokenSale } from '../../shared/godmode';
import { deployERC20 } from '../../shared/mocks';
import { shouldBehaveLikeAccessControllable } from '../access-controllable/access-controllable.behavior';
import { shouldBehaveLikeERC20TokenRecoverable } from '../recoverable/recoverable.behavior';
import { shouldBehaveLikeTokenSale } from './token-sale.behavior';

async function tokenSaleFixture(signers: Signer[], custody: string) {
  const [deployer, operator] = signers;
  const [deployerAddress, operatorAddress] = await Promise.all([deployer.getAddress(), operator.getAddress()]);
  const acl = await deployACL(deployer, { admin: deployerAddress, operator: operatorAddress, silent: true });

  const gameToken = await deployGameToken(deployer, { acl: acl.address, admin: deployerAddress });
  const erc20 = await deployERC20();
  const mockToken = await deployMockERC20(deployer, { decimals: 18 });
  const tokenSale = await deployTokenSale(deployer, {
    acl: acl.address,
    vestingPeriod: 300,
    custody,
    gameToken: gameToken.address,
    paymentToken: erc20.address,
    silent: true,
  });

  const godModeTokenSale = await deployGodModeTokenSale();
  await godModeTokenSale.__god_mode_setACL(acl.address);
  await godModeTokenSale.__god_mode_setCustody(custody);
  await godModeTokenSale.__god_mode_setGameToken(gameToken.address);
  await godModeTokenSale.__god_mode_setPaymentToken(erc20.address);
  await godModeTokenSale.__god_mode_setVestingPeriod(300);

  return {
    acl,
    tokenSale,
    mockToken,
    erc20,
    gameToken,
    godModeTokenSale,
  };
}

export function unitTestTokenSale(): void {
  describe('Token Sale', function () {
    const fixture = (signers: Signer[]) => tokenSaleFixture(signers, this.ctx.signers.custody.address);
    beforeEach(async function () {
      const { admin } = this.signers;
      const { acl, tokenSale, mockToken, gameToken, erc20, godModeTokenSale } = await this.loadFixture(fixture);

      this.contracts.acl = acl;
      this.contracts.mockToken = mockToken;
      this.contracts.tokenSale = tokenSale;
      this.contracts.gameToken = gameToken;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(tokenSale.address, admin);
      this.contracts.accessControllable = AccessControllable__factory.connect(tokenSale.address, this.signers.admin);
      this.mocks.erc20 = erc20;
      this.godMode.tokenSale = godModeTokenSale;
    });
    shouldBehaveLikeTokenSale();
    shouldBehaveLikeERC20TokenRecoverable();
    shouldBehaveLikeAccessControllable();
  });
}
