import { FakeContract } from '@defi-wonderland/smock';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumberish, ContractTransaction } from 'ethers';
import MerkleTree from 'merkletreejs';
import { beforeEach } from 'mocha';
import forEach from 'mocha-each';
import { createAllowlistMerkleTree, createAllowlistMerkleTreeLeaf } from '../../../../scripts/utils';
import { ERC20Mock, GameToken, GodModeTokenSale, TokenSale } from '../../../../typechain';
import { EMPTY_MERKLE_ROOT, ONE_TOKEN } from '../../../shared/constants';
import { currentTime, getRoundAdded, nextBlock } from '../../../shared/utils';

export function shouldBehaveLikeBuy() {
  const ROUND_DURATION = 100;
  const ROUND_CAP = 1000n * ONE_TOKEN;
  const ROUND_PRICE = ONE_TOKEN;
  let erc20: FakeContract<ERC20Mock>;
  let admin: SignerWithAddress;
  let operator: SignerWithAddress;
  let custody: SignerWithAddress;
  let user: SignerWithAddress;
  let tokenSale: GodModeTokenSale;
  let gameToken: GameToken;
  let addRound: (options: {
    start: number;
    cap?: BigNumberish;
    duration?: number;
    price?: BigNumberish;
    merkleRoot?: string;
  }) => Promise<ContractTransaction>;
  beforeEach(function () {
    ({ admin, operator, custody, user } = this.signers);
    ({ gameToken } = this.contracts);
    ({ erc20 } = this.mocks);
    ({ tokenSale } = this.godMode);

    addRound = async ({
      start,
      cap = ROUND_CAP,
      duration = ROUND_DURATION,
      price = ROUND_PRICE,
      merkleRoot = EMPTY_MERKLE_ROOT,
    }) => {
      await gameToken.connect(admin).transfer(custody.address, ROUND_CAP);
      await gameToken.connect(custody).approve(tokenSale.address, ROUND_CAP);
      return await tokenSale.connect(operator).addRound(start, duration, price, cap, merkleRoot);
    };
  });

  context('when round does not exist', () => {
    it('reverts', async () => {
      await expect(tokenSale.buy(999, ONE_TOKEN, [])).to.be.revertedWith(`InvalidRoundIndex(999)`);
    });
  });

  context('when round is not started yet', () => {
    let roundStart: number;
    beforeEach(async () => {
      const now = await currentTime();
      roundStart = now + 100;
      await addRound({ start: roundStart });
    });

    it('reverts', async () => {
      await expect(tokenSale.buy(0, ONE_TOKEN, [])).to.be.revertedWith(`RoundIsNotStarted(${roundStart})`);
    });
  });

  context('when round started', () => {
    let roundStart: number;
    let currentRound: number;
    beforeEach(async () => {
      const now = await currentTime();
      roundStart = now + 100;
      await addRound({ start: roundStart });

      await nextBlock(roundStart);

      currentRound = await tokenSale.getCurrentRoundIndex();
    });

    context('when round index does not equal current round', () => {
      beforeEach(async () => {
        await addRound({ start: roundStart + 200 });
      });

      it('reverts', async () => {
        await expect(tokenSale.buy(currentRound + 1, ONE_TOKEN, [])).to.be.revertedWith(
          `RoundIsNotStarted(${roundStart + 200})`,
        );
      });
    });

    context('when user is not in allowlist', () => {
      it('reverts', async () => {
        await expect(tokenSale.connect(user).buy(currentRound, ONE_TOKEN, [])).to.be.revertedWith(
          `AccountNotAllowlisted("${user.address}")`,
        );
      });
    });

    context('when user is in allowlist mapping', () => {
      beforeEach(async () => {
        await tokenSale.connect(operator).addToAllowlist(currentRound, [user.address]);
      });

      context('when user did not approved tokens', () => {
        it('reverts', async () => {
          await expect(tokenSale.connect(user).buy(currentRound, ONE_TOKEN, [])).to.be.reverted;
        });
      });

      context('when user wants to buy more than round cap', () => {
        const TO_BUY = ROUND_CAP + 1n;

        beforeEach(async () => {
          await erc20.connect(user).approve(tokenSale.address, TO_BUY);
        });

        it('reverts', async () => {
          await expect(tokenSale.connect(user).buy(currentRound, TO_BUY, [])).to.be.revertedWith(
            `NotEnoughTokensLeftInCurrentRound(${ROUND_CAP}, ${TO_BUY})`,
          );
        });
      });

      context('when user wants to buy more than tokens left', () => {
        beforeEach(async () => {
          await erc20.transfer(user.address, ROUND_CAP + ONE_TOKEN);
          await erc20.connect(user).approve(tokenSale.address, ROUND_CAP + ONE_TOKEN);

          await tokenSale.connect(user).buy(currentRound, ROUND_CAP - ONE_TOKEN, []);
        });

        it('reverts', async () => {
          await expect(tokenSale.connect(user).buy(currentRound, ONE_TOKEN + 1n, [])).to.be.revertedWith(
            `NotEnoughTokensLeftInCurrentRound(${ONE_TOKEN}, ${ONE_TOKEN + 1n})`,
          );
        });
      });

      context('when user buys one token', () => {
        beforeEach(async () => {
          await erc20.transfer(user.address, ONE_TOKEN);
          await erc20.connect(user).approve(tokenSale.address, ONE_TOKEN);
        });

        it('succeeds', async () => {
          await tokenSale.connect(user).buy(currentRound, ONE_TOKEN, []);

          await expect(tokenSale.getBalance(user.address)).eventually.to.eq(ONE_TOKEN);
        });

        it('payment tokens goes to custody', async () => {
          await expect(() => tokenSale.connect(user).buy(currentRound, ONE_TOKEN, [])).to.changeTokenBalances(
            erc20,
            [user, custody],
            [-ONE_TOKEN, ONE_TOKEN],
          );
        });

        context('when one round does not have buyers', () => {
          beforeEach(async () => {
            const now = await currentTime();
            await addRound({ start: now + 100 });
            await nextBlock(now + 150);
            currentRound = await tokenSale.getCurrentRoundIndex();
            await tokenSale.connect(operator).addToAllowlist(currentRound, [user.address]);
          });

          it('allows to buy', async () => {
            await tokenSale.connect(user).buy(currentRound, ONE_TOKEN, []);

            await expect(tokenSale.getBalance(user.address)).eventually.to.eq(ONE_TOKEN);
          });
        });

        context('when multiple rounds does not have buyers', () => {
          beforeEach(async () => {
            const now = await currentTime();
            for (let i = 100; i <= 700; i += 200) {
              await addRound({ start: now + i });
            }
            await nextBlock(now + 750);
            currentRound = await tokenSale.getCurrentRoundIndex();
            await tokenSale.connect(operator).addToAllowlist(currentRound, [user.address]);
          });

          it('allows to buy', async () => {
            await tokenSale.connect(user).buy(currentRound, ONE_TOKEN, []);

            await expect(tokenSale.getBalance(user.address)).eventually.to.eq(ONE_TOKEN);
          });
        });
      });

      context('when user buys in multiple rounds', () => {
        let now: number;
        beforeEach(async () => {
          await erc20.transfer(user.address, 10n * ONE_TOKEN);
          await erc20.connect(user).approve(tokenSale.address, 10n * ONE_TOKEN);

          now = await currentTime();
          for (let i = 100; i <= 700; i += 200) {
            const { index } = await getRoundAdded(
              await addRound({ start: now + i }),
              tokenSale as unknown as TokenSale,
            );
            await tokenSale.connect(operator).addToAllowlist(index, [user.address]);
          }
        });

        it('succeeds', async () => {
          for (let i = 100; i <= 700; i += 200) {
            await nextBlock(now + i + 50);
            const currentRound = await tokenSale.getCurrentRoundIndex();
            await tokenSale.connect(user).buy(currentRound, ONE_TOKEN, []);
          }
          await expect(tokenSale.getBalance(user.address)).eventually.to.eq(4n * ONE_TOKEN);
        });
      });
    });
  });

  context('when round ended', () => {
    let roundStart: number;
    beforeEach(async () => {
      const now = await currentTime();
      roundStart = now + 100;
      await addRound({ start: roundStart });
      await nextBlock(roundStart + 100);
    });

    it('reverts', async () => {
      await expect(tokenSale.buy(0, ONE_TOKEN, [])).to.be.revertedWith(`RoundEnded(${roundStart + 100})`);
    });
  });

  context('when round has different price', () => {
    forEach([
      [(ONE_TOKEN * 3n) / 2n, ONE_TOKEN * 150n],
      [ONE_TOKEN * 2n, ONE_TOKEN * 200n],
      [(ONE_TOKEN * 6n) / 10n, ONE_TOKEN * 60n],
      [(ONE_TOKEN * 9n) / 10n, ONE_TOKEN * 90n],
      [100_000_000n, 100_000_000n * 100n],
      [1_000_000n, 1_000_000n * 100n],
      [1_500_000n, 1_500_000n * 100n],
      [1_750_000n, 1_750_000n * 100n],
    ]).describe(
      `buys 100 tokens at %s per token price and pays %s`,
      (price: BigNumberish, expectedPayment: BigNumberish) => {
        let currentRound: number;
        let roundStart: number;
        beforeEach(async () => {
          const now = await currentTime();
          roundStart = now + 100;
          await addRound({ start: roundStart, price });
          await nextBlock(roundStart + 50);

          currentRound = await tokenSale.getCurrentRoundIndex();
          await tokenSale.connect(operator).addToAllowlist(currentRound, [user.address]);
          await erc20.transfer(user.address, ONE_TOKEN * 10000n);
          await erc20.connect(user).approve(tokenSale.address, ONE_TOKEN * 10000n);
        });

        it('estimates 100 tokens', async () => {
          await expect(tokenSale.estimateBuy(currentRound, ONE_TOKEN * 100n)).eventually.to.eq(expectedPayment);
        });

        it('buys 100 tokens', async () => {
          await expect(() => tokenSale.connect(user).buy(currentRound, ONE_TOKEN * 100n, [])).to.changeTokenBalances(
            erc20,
            [user, custody],
            [-expectedPayment, expectedPayment],
          );

          await expect(tokenSale.getBalance(user.address)).eventually.to.eq(ONE_TOKEN * 100n);
        });
      },
    );
  });

  context('with merkle proof', () => {
    let currentRound: number;
    let tree: MerkleTree;
    let leafFunction: (account: string) => string;
    beforeEach(async () => {
      const roundStart = (await currentTime()) + 100;
      const chainId = await admin.getChainId();
      tree = createAllowlistMerkleTree(chainId, tokenSale.address, [user.address, admin.address]);
      leafFunction = (account: string) => createAllowlistMerkleTreeLeaf(chainId, tokenSale.address, account);

      await addRound({ start: roundStart, merkleRoot: tree.getHexRoot() });
      await nextBlock(roundStart + 50);

      currentRound = await tokenSale.getCurrentRoundIndex();
      await erc20.transfer(user.address, ONE_TOKEN * 10000n);
      await erc20.connect(user).approve(tokenSale.address, ONE_TOKEN * 10000n);
    });

    it('100 tokens', async () => {
      await expect(() =>
        tokenSale.connect(user).buy(currentRound, ONE_TOKEN * 100n, tree.getHexProof(leafFunction(user.address))),
      ).to.changeTokenBalances(erc20, [user, custody], [-ONE_TOKEN * 100n, ONE_TOKEN * 100n]);

      await expect(tokenSale.getBalance(user.address)).eventually.to.eq(ONE_TOKEN * 100n);
    });
  });
}
