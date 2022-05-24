import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { signERC2612Permit } from 'eth-permit';
import { BigNumber } from 'ethers';
import { GameToken, Staking } from '../../../typechain';
import { ONE_TOKEN } from '../../shared/constants';
import { currentTime, getStakeEvent, setNextBlockTimestamp } from '../../shared/utils';

export function shouldBehaveLikeStaking() {
  context('Staking', function () {
    let staking: Staking;
    let operator: SignerWithAddress;
    let other: SignerWithAddress;
    let stranger: SignerWithAddress;
    let custody: SignerWithAddress;
    let gameToken: GameToken;

    const DAY = 86400;

    beforeEach(async function () {
      ({ staking, gameToken } = this.contracts);
      ({ operator, other, stranger, custody } = this.signers);
      await Promise.all([
        gameToken.transfer(operator.address, 100n * ONE_TOKEN),
        gameToken.transfer(other.address, 100n * ONE_TOKEN),
        gameToken.transfer(stranger.address, 100n * ONE_TOKEN),
        gameToken.transfer(custody.address, 200n * ONE_TOKEN),
        gameToken.connect(custody).approve(staking.address, 200n * ONE_TOKEN),
      ]);
    });

    context('Basic schedule', function () {
      const DAY_PERCENTAGE = 2n;
      const DAY_PERCENTAGE_ADJUSTED = DAY_PERCENTAGE * 10000n;

      const DAYx5_PERCENTAGE = 15n;
      const DAYx5_PERCENTAGE_ADJUSTED = DAYx5_PERCENTAGE * 10000n;

      beforeEach(async function () {
        await staking.setLockPeriods([
          { period: DAY, rewardPercentage: DAY_PERCENTAGE_ADJUSTED },
          { period: 5 * DAY, rewardPercentage: DAYx5_PERCENTAGE_ADJUSTED },
        ]);
      });

      it('should return pool settings', async function () {
        const settings = await staking.getLockPeriods();
        expect(
          settings.find(lp => lp.period.toNumber() == DAY)?.rewardPercentage.toBigInt() == DAY_PERCENTAGE_ADJUSTED,
        );
        expect(
          settings.find(lp => lp.period.toNumber() == DAY * 5)?.rewardPercentage.toBigInt() ==
            DAYx5_PERCENTAGE_ADJUSTED,
        );
      });

      context('Stakes', function () {
        const STAKE_AMOUNT = 100n * ONE_TOKEN;
        const STAKE_PERIOD = DAY;

        let stakeTokenId: BigNumber;
        let stakeWithInterest: bigint;
        let stakeTime: number;

        context('Simple stake', function () {
          beforeEach(async function () {
            await gameToken.connect(other).approve(staking.address, STAKE_AMOUNT);
            ({ stakeTokenId } = await getStakeEvent(staking.connect(other).stake(STAKE_AMOUNT, STAKE_PERIOD), staking));

            stakeWithInterest = (STAKE_AMOUNT * (100n + DAY_PERCENTAGE)) / 100n;
            stakeTime = await currentTime();
          });

          it('should reserve correct amount', async function () {
            expect((await gameToken.balanceOf(staking.address)).eq(stakeWithInterest));
          });

          it('happy path', async function () {
            await setNextBlockTimestamp(stakeTime + STAKE_PERIOD);
            await staking.connect(other).withdraw(stakeTokenId);
            expect((await gameToken.balanceOf(other.address)).eq(stakeWithInterest));
          });

          it('should show stake info', async function () {
            const { amount, unlockTimestamp } = await staking.connect(other).getStakeInfo(stakeTokenId);

            expect(amount).to.be.eq(stakeWithInterest);
            expect(unlockTimestamp).to.be.eq(stakeTime + STAKE_PERIOD);
          });

          it('should not allow to withdraw the stake too soon', async function () {
            await setNextBlockTimestamp(stakeTime + STAKE_PERIOD - 1);
            await expect(staking.connect(other).withdraw(stakeTokenId)).to.be.reverted;
          });

          context('2-nd stake', function () {
            const STAKE_AMOUNT_2 = STAKE_AMOUNT / 2n;
            let stakeTime2: number;

            beforeEach(async function () {
              await gameToken.transfer(other.address, STAKE_AMOUNT_2);
              await gameToken.connect(other).approve(staking.address, STAKE_AMOUNT_2);
              stakeTime2 = stakeTime + DAY / 2;
            });

            it('should allow multiple stakes', async function () {
              await setNextBlockTimestamp(stakeTime2);
              const { stakeTokenId: stakeTokenId2 } = await getStakeEvent(
                staking.connect(other).stake(STAKE_AMOUNT_2, STAKE_PERIOD),
                staking,
              );

              await setNextBlockTimestamp(stakeTime2 + STAKE_PERIOD);
              await staking.connect(other).withdraw(stakeTokenId);
              expect((await gameToken.balanceOf(other.address)).eq(stakeWithInterest));

              const stakeWithInterest2 = ((STAKE_AMOUNT_2 * (100n + DAY_PERCENTAGE)) / 100n) * ONE_TOKEN;
              await staking.connect(other).withdraw(stakeTokenId2);
              expect((await gameToken.balanceOf(other.address)).eq(stakeWithInterest + stakeWithInterest2));
            });

            context('2-nd stake with changed settings', function () {
              let stakeWithInterest2: bigint;
              const NEW_DAY_PERCENTAGE = DAY_PERCENTAGE * 2n;
              let stakeTokenId2: BigNumber;

              beforeEach(async function () {
                await staking.setLockPeriods([{ period: DAY, rewardPercentage: NEW_DAY_PERCENTAGE }]);
                stakeWithInterest2 = ((STAKE_AMOUNT_2 * (100n + NEW_DAY_PERCENTAGE)) / 100n) * ONE_TOKEN;

                await setNextBlockTimestamp(stakeTime2);
                ({ stakeTokenId: stakeTokenId2 } = await getStakeEvent(
                  staking.connect(other).stake(STAKE_AMOUNT_2, STAKE_PERIOD),
                  staking,
                ));

                await setNextBlockTimestamp(stakeTime2 + STAKE_PERIOD);
              });

              it('should change settings for new stakes', async function () {
                await staking.connect(other).withdraw(stakeTokenId2);
                expect((await gameToken.balanceOf(other.address)).eq(stakeWithInterest + stakeWithInterest2));
              });

              it('should not change existing stakes', async function () {
                await staking.connect(other).withdraw(stakeTokenId);
                expect((await gameToken.balanceOf(other.address)).eq(stakeWithInterest));
              });
            });
          });
        });

        context('Stake with Permit', function () {
          this.beforeEach(async function () {
            const permit = await signERC2612Permit(
              other,
              gameToken.address,
              other.address,
              staking.address,
              STAKE_AMOUNT.toString(10),
            );

            ({ stakeTokenId } = await getStakeEvent(
              staking
                .connect(other)
                .stakeWithPermit(STAKE_AMOUNT, STAKE_PERIOD, permit.deadline, permit.v, permit.r, permit.s),
              staking,
            ));

            stakeWithInterest = (STAKE_AMOUNT * (100n + DAY_PERCENTAGE)) / 100n;
            stakeTime = await currentTime();
          });

          it('happy path', async function () {
            await setNextBlockTimestamp(stakeTime + STAKE_PERIOD);
            await staking.connect(other).withdraw(stakeTokenId);
            expect((await gameToken.balanceOf(other.address)).eq(stakeWithInterest));
          });
        });
      });
    });
  });
}
