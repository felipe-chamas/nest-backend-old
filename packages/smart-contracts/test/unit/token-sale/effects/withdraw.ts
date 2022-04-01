import { MockContract } from '@defi-wonderland/smock';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ERC20Mock, GameToken, TokenSale } from '../../../../typechain';
import { EMPTY_MERKLE_ROOT, ONE_TOKEN } from '../../../shared/constants';
import { currentTime, nextBlock, setNextBlockTimestamp } from '../../../shared/utils';

export function shouldBehaveLikeWithdraw() {
  const ROUND_DURATION = 100;
  const ROUND_CAP = 1000n * ONE_TOKEN;
  const ROUND_PRICE = ONE_TOKEN;
  let OPERATOR_ROLE: string;
  let admin: SignerWithAddress;
  let operator: SignerWithAddress;
  let custody: SignerWithAddress;
  let stranger: SignerWithAddress;
  let user: SignerWithAddress;
  let tokenSale: TokenSale;
  let gameToken: GameToken;
  let erc20: MockContract<ERC20Mock>;
  let now: number;
  let currentRound: number;
  beforeEach(async function () {
    ({ admin, stranger, operator, custody, user } = this.signers);
    ({ tokenSale, gameToken } = this.contracts);
    ({ erc20 } = this.mocks);
    ({ OPERATOR_ROLE } = this.roles);

    now = await currentTime();
    await gameToken.connect(admin).transfer(custody.address, ROUND_CAP);
    await gameToken.connect(custody).approve(tokenSale.address, ROUND_CAP);
    await tokenSale.connect(operator).addRound(now + 100, ROUND_DURATION, ROUND_PRICE, ROUND_CAP, EMPTY_MERKLE_ROOT);

    await setNextBlockTimestamp(now + 150);

    await erc20.transfer(user.address, ONE_TOKEN);
    await erc20.connect(user).approve(tokenSale.address, ONE_TOKEN);

    currentRound = await tokenSale.getCurrentRoundIndex();
    await tokenSale.connect(operator).addToAllowlist(currentRound, [user.address]);
    await tokenSale.connect(user).buy(currentRound, ONE_TOKEN, []);
  });

  context('when operator specifies invalid round', () => {
    it('reverts', async () => {
      await expect(tokenSale.connect(operator).withdraw(999)).revertedWith(`InvalidRoundIndex(999)`);
    });
  });

  context('when round is in progress', () => {
    context('when operator calls withdraw', () => {
      it('reverts', async () => {
        await expect(tokenSale.connect(operator).withdraw(currentRound)).revertedWith(
          `RoundIsNotFinished(${now + 200})`,
        );
      });
    });
  });

  context('when round is finished', () => {
    beforeEach(async () => {
      await nextBlock(now + 200);
    });

    context('when operator calls withdraw', () => {
      it('succeeds', async () => {
        const tokensLeft = ROUND_CAP - ONE_TOKEN;

        const tx = tokenSale.connect(operator).withdraw(currentRound);

        await expect(() => tx).to.changeTokenBalances(
          gameToken,
          [{ getAddress: () => tokenSale.address }, custody],
          [-tokensLeft, tokensLeft],
        );
        await expect(tx).to.emit(tokenSale, 'TokensWithdraw').withArgs(currentRound, custody.address, tokensLeft);
      });
    });

    context('when operator calls withdraw again', () => {
      beforeEach(async () => {
        await tokenSale.connect(operator).withdraw(currentRound);
      });

      it('does nothing', async () => {
        await expect(() => tokenSale.connect(operator).withdraw(currentRound)).to.changeTokenBalances(
          gameToken,
          [{ getAddress: () => tokenSale.address }, custody],
          [0, 0],
        );
      });
    });

    context('when stranger calls withdraw', () => {
      it('reverts', async () => {
        await expect(tokenSale.connect(stranger).withdraw(currentRound)).to.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`,
        );
      });
    });
  });
}
