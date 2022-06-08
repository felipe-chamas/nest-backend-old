import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumberish, ContractTransaction } from 'ethers';
import { beforeEach } from 'mocha';
import forEach from 'mocha-each';
import { GameToken, TokenSale } from '../../../../typechain';
import { EMPTY_MERKLE_ROOT, ONE_TOKEN } from '../../../shared/constants';
import { currentTime, nextBlock } from '../../../shared/utils';

export function shouldBehaveLikeCurrentRoundIndex() {
  const ROUND_DURATION = 100;
  const ROUND_CAP = 1000n * ONE_TOKEN;
  const ROUND_PRICE = ONE_TOKEN;
  let admin: SignerWithAddress;
  let operator: SignerWithAddress;
  let custody: SignerWithAddress;
  let tokenSale: TokenSale;
  let gameToken: GameToken;
  let addRound: (
    signer: SignerWithAddress,
    options: { start: number; cap?: BigNumberish; duration?: number; price?: BigNumberish; merkleRoot?: string },
  ) => Promise<ContractTransaction>;
  beforeEach(function () {
    ({ admin, operator, custody } = this.signers);
    ({ tokenSale, gameToken } = this.contracts);

    addRound = async (
      signer: SignerWithAddress,
      { start, cap = ROUND_CAP, duration = ROUND_DURATION, price = ROUND_PRICE, merkleRoot = EMPTY_MERKLE_ROOT },
    ) => {
      await gameToken.connect(admin).transfer(custody.address, ROUND_CAP);
      await gameToken.connect(custody).approve(tokenSale.address, ROUND_CAP);
      return await tokenSale.connect(signer).addRound(start, duration, price, cap, merkleRoot);
    };
  });

  context('with current time', () => {
    let now: number;
    beforeEach(async () => {
      now = await currentTime();
    });

    context('when there are no rounds', () => {
      it('reverts', async () => {
        await expect(tokenSale.getCurrentRoundIndex()).to.be.revertedWith('NoRounds()');
      });
    });

    context('when there is one round', () => {
      beforeEach(async () => {
        await addRound(operator, { start: now + 100 });
      });

      context('when first round is not started', () => {
        it('reverts', async () => {
          await expect(tokenSale.getCurrentRoundIndex()).throws;
        });
      });

      context('when round is started', () => {
        beforeEach(async () => {
          await nextBlock(now + 150);
        });

        it('returns 0', async () => {
          await expect(tokenSale.getCurrentRoundIndex()).eventually.to.eq(0);
        });
      });

      context('when round is ended', () => {
        beforeEach(async () => {
          await nextBlock(now + 1000);
        });

        it('returns 0', async () => {
          await expect(tokenSale.getCurrentRoundIndex()).eventually.to.eq(0);
        });
      });
    });

    context('when there are multiple rounds with intervals between rounds', function () {
      beforeEach(async () => {
        for (let i = 100; i < 800; i += 200) {
          await addRound(operator, { start: now + i });
        }
      });

      context('when first round is not started', () => {
        it('reverts', async () => {
          await expect(tokenSale.getCurrentRoundIndex()).throws;
        });
      });

      const testSets = [
        [0, 150],
        [1, 350],
        [2, 550],
        [3, 750],
      ];

      forEach(testSets).describe('when round %d starts', (round: number, startShift: number) => {
        context('when round is started', () => {
          beforeEach(async () => {
            await nextBlock(now + startShift);
          });

          it(`returns round ${round}`, async () => {
            await expect(tokenSale.getCurrentRoundIndex()).eventually.to.eq(round);
          });
        });

        context('when round is ended', () => {
          beforeEach(async () => {
            await nextBlock(now + startShift + 50);
          });

          it(`returns round ${round}`, async () => {
            await expect(tokenSale.getCurrentRoundIndex()).eventually.to.eq(round);
          });
        });

        context('when between rounds', () => {
          beforeEach(async () => {
            await nextBlock(now + startShift + 100);
          });

          it(`returns round ${round}`, async () => {
            await expect(tokenSale.getCurrentRoundIndex()).eventually.to.eq(round);
          });
        });
      });

      context('when time passes last round', () => {
        beforeEach(async () => {
          await nextBlock(now + 1000);
        });

        it('returns last round index', async () => {
          const roundCount = await tokenSale.getRoundCount();

          await expect(tokenSale.getCurrentRoundIndex()).eventually.to.eq(roundCount.toNumber() - 1);
        });
      });
    });

    context('when there are multiple rounds without intervals between rounds', function () {
      beforeEach(async () => {
        for (let i = 100; i < 800; i += 100) {
          await addRound(operator, { start: now + i });
        }
      });

      context('when first round is not started', () => {
        it('reverts', async () => {
          await expect(tokenSale.getCurrentRoundIndex()).throws;
        });
      });

      const testSets = [
        [0, 150],
        [1, 250],
        [2, 350],
        [3, 450],
        [4, 550],
      ];

      forEach(testSets).describe('when round %d starts', (round: number, startShift: number) => {
        context('when round is started', () => {
          beforeEach(async () => {
            await nextBlock(now + startShift);
          });

          it(`returns round ${round}`, async () => {
            await expect(tokenSale.getCurrentRoundIndex()).eventually.to.eq(round);
          });
        });

        context('when round is ended', () => {
          beforeEach(async () => {
            await nextBlock(now + startShift + 50);
          });

          it(`returns round ${round + 1}`, async () => {
            await expect(tokenSale.getCurrentRoundIndex()).eventually.to.eq(round + 1);
          });
        });
      });

      context('when time passes last round', () => {
        beforeEach(async () => {
          await nextBlock(now + 1000);
        });

        it('returns last round index', async () => {
          const roundCount = await tokenSale.getRoundCount();

          await expect(tokenSale.getCurrentRoundIndex()).eventually.to.eq(roundCount.toNumber() - 1);
        });
      });
    });
  });
}
