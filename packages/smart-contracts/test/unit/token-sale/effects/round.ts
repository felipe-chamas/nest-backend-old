import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumberish, ContractTransaction } from 'ethers';
import { ethers } from 'hardhat';
import { beforeEach } from 'mocha';
import { GameToken, TokenSale } from '../../../../typechain';
import { EMPTY_MERKLE_ROOT, ONE_TOKEN } from '../../../shared/constants';
import { Roles } from '../../../shared/types';
import { currentTime, getRoundAdded, setNextBlockTimestamp } from '../../../shared/utils';

export function shouldBehaveLikeRound() {
  let admin: SignerWithAddress;
  let operator: SignerWithAddress;
  let stranger: SignerWithAddress;
  let other: SignerWithAddress;
  let custody: SignerWithAddress;
  let tokenSale: TokenSale;
  let gameToken: GameToken;
  let now: number;
  beforeEach(async function () {
    ({ admin, stranger, operator, other, custody } = this.signers);
    ({ tokenSale, gameToken } = this.contracts);
    now = await currentTime();
  });

  context('before round added', () => {
    context('when calling functions with round index', () => {
      it('fails to check allowlisted', async () => {
        await expect(tokenSale.isAllowlisted(0, other.address, [])).to.be.revertedWith('InvalidRoundIndex(0)');
      });

      it('fails to estimateBuy', async () => {
        await expect(tokenSale.connect(operator).estimateBuy(0, ONE_TOKEN)).to.be.revertedWith('InvalidRoundIndex(0)');
      });

      it('fails to buy', async () => {
        await expect(tokenSale.connect(operator).buy(0, ONE_TOKEN, [])).to.be.revertedWith('InvalidRoundIndex(0)');
      });

      it('fails to withdraw', async () => {
        await expect(tokenSale.connect(operator).withdraw(0)).to.be.revertedWith('InvalidRoundIndex(0)');
      });

      it('fails to set round merkle root', async () => {
        await expect(tokenSale.connect(operator).setRoundMerkleRoot(0, EMPTY_MERKLE_ROOT)).to.be.revertedWith(
          'InvalidRoundIndex(0)',
        );
      });
    });
  });

  context('add round', () => {
    const ROUND_CAP = 1000n * ONE_TOKEN;
    const ROUND_PRICE = ONE_TOKEN;
    const ROUND_DURATION = 100;
    let addRound: (
      signer: SignerWithAddress,
      options: { start: number; cap?: BigNumberish; duration?: number; price?: BigNumberish; merkleRoot?: string },
    ) => Promise<ContractTransaction>;

    beforeEach(async () => {
      await gameToken.connect(admin).transfer(custody.address, ROUND_CAP * 5n);
      await gameToken.connect(custody).approve(tokenSale.address, ROUND_CAP * 5n);

      addRound = async (
        signer: SignerWithAddress,
        { start, cap = ROUND_CAP, duration = ROUND_DURATION, price = ROUND_PRICE, merkleRoot = EMPTY_MERKLE_ROOT },
      ) => {
        await gameToken.connect(admin).transfer(custody.address, ROUND_CAP);
        await gameToken.connect(custody).approve(tokenSale.address, ROUND_CAP);
        return await tokenSale.connect(signer).addRound(start, duration, price, cap, merkleRoot);
      };
    });

    context('when called by operator', () => {
      it('should allow add round', async () => {
        await expect(addRound(operator, { start: now + 10 }))
          .to.emit(tokenSale, 'RoundAdded')
          .withArgs(0, now + 10, ROUND_DURATION, ROUND_PRICE, ROUND_CAP, EMPTY_MERKLE_ROOT);
      });

      context('when operator adds round in past', () => {
        it('reverts', async () => {
          await expect(addRound(operator, { start: now })).to.be.revertedWith(`RoundStartInPast(${now})`);
        });
      });

      context('when operator adds round with zero price', () => {
        it('reverts', async () => {
          await expect(addRound(operator, { start: now, price: 0 })).to.be.revertedWith(`InvalidTokenPrice()`);
        });
      });

      context('when operator adds round with zero cap', () => {
        it('reverts', async () => {
          await expect(addRound(operator, { start: now, cap: 0 })).to.be.revertedWith(`InvalidTokenCap()`);
        });
      });
    });

    context('multiple rounds', () => {
      it('adds', async () => {
        await addRound(operator, { start: now + 100 });

        await expect(addRound(operator, { start: now + 1000 }))
          .to.emit(tokenSale, 'RoundAdded')
          .withArgs(1, now + 1000, ROUND_DURATION, ROUND_PRICE, ROUND_CAP, EMPTY_MERKLE_ROOT);
      });

      context('when added round has intersection with previous round', () => {
        it('reverts', async () => {
          await addRound(operator, { start: now + 100 });

          await expect(addRound(operator, { start: now + 150 })).to.be.revertedWith(
            `InvalidRoundStart(${now + 200}, ${now + 150})`,
          );
        });
      });
    });

    context('when called by stranger', () => {
      it('reverts', async () => {
        await expect(addRound(stranger, { start: now + 1 })).to.be.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.OPERATOR_ROLE}`,
        );
      });
    });

    context('set round merkle tree', () => {
      const NEW_ROUND_MERKLE_ROOT = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('TESTING_MERKLE_ROOT'));
      let roundIndex: number;
      let roundStart: number;
      beforeEach(async function () {
        roundStart = now + 100;
        ({ index: roundIndex } = await getRoundAdded(await addRound(operator, { start: roundStart }), tokenSale));
      });
      context('when called by operator', () => {
        it('allows', async () => {
          await expect(tokenSale.connect(operator).setRoundMerkleRoot(roundIndex, NEW_ROUND_MERKLE_ROOT))
            .to.emit(tokenSale, 'RoundMerkleRootChanged')
            .withArgs(roundIndex, EMPTY_MERKLE_ROOT, NEW_ROUND_MERKLE_ROOT);

          await expect(tokenSale.getRound(roundIndex)).eventually.have.property('merkleRoot').eq(NEW_ROUND_MERKLE_ROOT);
        });

        context('when set after round start', () => {
          beforeEach(async () => {
            await setNextBlockTimestamp(roundStart + 1);
          });

          it('reverts', async () => {
            await expect(
              tokenSale.connect(operator).setRoundMerkleRoot(roundIndex, NEW_ROUND_MERKLE_ROOT),
            ).to.be.revertedWith(`RoundAlreadyStarted(${roundStart})`);
          });
        });
      });

      context('when called by stranger', () => {
        it('reverts', async () => {
          await expect(
            tokenSale.connect(stranger).setRoundMerkleRoot(roundIndex, NEW_ROUND_MERKLE_ROOT),
          ).to.be.revertedWith(
            `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.OPERATOR_ROLE}`,
          );
        });
      });
    });
  });
}
