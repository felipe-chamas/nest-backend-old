import { MockContract } from '@defi-wonderland/smock';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ERC20Mock, GameToken, TokenSale } from '../../../../typechain';
import { EMPTY_MERKLE_ROOT, ONE_TOKEN } from '../../../shared/constants';
import { currentTime, setNextBlockTimestamp } from '../../../shared/utils';

export function shouldBehaveLikeClaim() {
  const ROUND_DURATION = 100;
  const ROUND_CAP = 1000n * ONE_TOKEN;
  const ROUND_PRICE = ONE_TOKEN;
  let vestingPeriod: number;
  let admin: SignerWithAddress;
  let operator: SignerWithAddress;
  let custody: SignerWithAddress;
  let user: SignerWithAddress;
  let tokenSale: TokenSale;
  let gameToken: GameToken;
  let erc20: MockContract<ERC20Mock>;

  let now: number;
  beforeEach(async function () {
    ({ admin, operator, custody, user } = this.signers);
    ({ tokenSale, gameToken } = this.contracts);
    ({ erc20 } = this.mocks);

    now = await currentTime();
    vestingPeriod = (await tokenSale.getVestingPeriod()).toNumber();

    await gameToken.connect(admin).transfer(custody.address, ROUND_CAP);
    await gameToken.connect(custody).approve(tokenSale.address, ROUND_CAP);
    await tokenSale.connect(operator).addRound(now + 100, ROUND_DURATION, ROUND_PRICE, ROUND_CAP, EMPTY_MERKLE_ROOT);

    await setNextBlockTimestamp(now + 150);

    await erc20.transfer(user.address, ONE_TOKEN);

    await erc20.connect(user).approve(tokenSale.address, ONE_TOKEN);
    const currentRound = await tokenSale.getCurrentRoundIndex();
    await tokenSale.connect(operator).addToAllowlist(currentRound, [user.address]);
    await tokenSale.connect(user).buy(currentRound, ONE_TOKEN, []);
  });

  context('when claiming before vesting start is set', () => {
    it('reverts', async () => {
      await expect(tokenSale.claim(user.address)).to.revertedWith('VestingNotStarted()');
    });
  });

  context('when claiming before vesting is not started', () => {
    beforeEach(async () => {
      await tokenSale.connect(operator).setVestingStart(now + 1000);
    });

    it('reverts', async () => {
      await expect(tokenSale.claim(user.address)).to.revertedWith('VestingNotStarted()');
    });
  });

  context('when vesting is started', () => {
    let vestingStart: number;
    beforeEach(async () => {
      vestingStart = now + 1000;
      await tokenSale.connect(operator).setVestingStart(vestingStart);
    });

    context('when half of vesting time passes after vesting started', () => {
      beforeEach(async () => {
        await setNextBlockTimestamp(vestingStart + vestingPeriod / 2);
      });
      context('when user claims tokens', () => {
        it('works', async () => {
          await expect(() => tokenSale.claim(user.address)).to.changeTokenBalances(
            gameToken,
            [{ getAddress: () => tokenSale.address }, user],
            [-ONE_TOKEN / 2n, ONE_TOKEN / 2n],
          );
        });
      });
    });
    context('when vesting period is over', () => {
      beforeEach(async () => {
        await setNextBlockTimestamp(vestingStart + vestingPeriod + 1);
      });

      context('when user claims tokens', () => {
        it('works', async () => {
          await expect(() => tokenSale.claim(user.address)).to.changeTokenBalances(
            gameToken,
            [{ getAddress: () => tokenSale.address }, user],
            [-ONE_TOKEN, ONE_TOKEN],
          );
        });
      });
    });
  });
}
