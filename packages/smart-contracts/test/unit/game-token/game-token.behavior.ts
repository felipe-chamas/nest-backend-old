import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { signERC2612Permit } from 'eth-permit';
import { ethers } from 'hardhat';
import { GameToken } from '../../../typechain';
import { AddressZero, ONE_TOKEN } from '../../shared/constants';
import { Roles } from '../../shared/types';

export function shouldBehaveLikeGameToken() {
  context('Game Token', function () {
    let token: GameToken;
    let stranger: SignerWithAddress;
    let admin: SignerWithAddress;
    let operator: SignerWithAddress;
    let other: SignerWithAddress;
    let user: SignerWithAddress;

    beforeEach(function () {
      ({ admin, other, stranger, operator, user } = this.signers);
      token = this.contracts.gameToken;
    });

    describe('Basic', function () {
      it('has name', async function () {
        await expect(token.name()).to.eventually.not.be.null;
      });

      it('has symbol', async function () {
        await expect(token.symbol()).to.eventually.not.be.null;
      });

      it('has decimals', async function () {
        await expect(token.decimals()).to.eventually.eq(18);
      });
    });

    describe('when unpaused', function () {
      it('should not allow stranger to pause', async function () {
        await expect(token.connect(stranger).pause()).to.be.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.OPERATOR_ROLE}`,
        );
      });

      it('should allow operator to pause', async function () {
        await token.connect(operator).pause();

        await expect(token.paused()).eventually.to.be.true;
      });
    });

    describe('when paused', function () {
      beforeEach(async function () {
        await token.connect(operator).pause();
      });

      it('should fail to transfer tokens', async function () {
        await expect(token.transfer(other.address, ONE_TOKEN)).to.be.revertedWith('Pausable: paused');
      });

      it('should allow to approve tokens', async function () {
        await token.approve(other.address, ONE_TOKEN);

        await expect(token.allowance(admin.address, other.address)).to.eventually.eq(ONE_TOKEN);
      });

      it('should fail to transfer approved tokens', async function () {
        await token.approve(other.address, ONE_TOKEN);

        await expect(token.connect(other).transferFrom(admin.address, other.address, ONE_TOKEN)).to.be.revertedWith(
          'Pausable: paused',
        );
      });

      context('when admin calls unpause()', () => {
        it('works', async () => {
          await token.connect(admin).unpause();

          await expect(token.paused()).eventually.to.be.false;
        });
      });

      context('when operator calls unpause()', () => {
        it('fails', async () => {
          await expect(token.connect(operator).unpause()).to.be.revertedWith(
            `AccessControl: account ${operator.address.toLowerCase()} is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`,
          );
        });
      });

      context('when stranger calls unpause()', () => {
        it('fails', async () => {
          await expect(token.connect(stranger).unpause()).to.be.revertedWith(
            `AccessControl: account ${stranger.address.toLowerCase()} is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`,
          );
        });
      });
    });

    context('batched transfers', () => {
      const BATCH_SIZE = 5;
      const BATCH_SIZE_LIMIT = 100;
      context('transferBatch', () => {
        context('when sender holds enough tokens', () => {
          it('works', async () => {
            const signers = (await ethers.getSigners()).slice(1, BATCH_SIZE + 1);
            const payees = signers.map(x => ({ account: x.address, amount: ONE_TOKEN }));

            await expect(() => token.transferBatch(payees))
              .to.emit(token, 'Transfer')
              .withArgs(admin.address, payees[0].account, payees[0].amount)
              .to.emit(token, 'Transfer')
              .withArgs(admin.address, payees[1].account, payees[1].amount)
              .to.emit(token, 'Transfer')
              .withArgs(admin.address, payees[2].account, payees[2].amount)
              .to.emit(token, 'Transfer')
              .withArgs(admin.address, payees[3].account, payees[3].amount)
              .to.emit(token, 'Transfer')
              .withArgs(admin.address, payees[4].account, payees[4].amount)
              .changeTokenBalances(
                token,
                [admin, ...signers],
                [-ONE_TOKEN * BigInt(BATCH_SIZE), ...payees.map(x => x.amount)],
              );
          });
        });

        context('when sender does not have enough tokens', () => {
          it('reverts', async () => {
            await expect(
              token.transferBatch([{ account: user.address, amount: ONE_TOKEN * 1_000_000n }]),
            ).to.be.revertedWith(`ERC20: transfer amount exceeds balance`);
          });
        });

        context('when sender sends tokens to zero address', () => {
          it('reverts', async () => {
            await expect(token.transferBatch([{ account: AddressZero, amount: ONE_TOKEN }])).to.be.revertedWith(
              `ERC20: transfer to the zero address`,
            );
          });
        });

        context('when batch size is too large', () => {
          it('reverts', async () => {
            const batch: GameToken.PayeeStruct[] = [...Array(BATCH_SIZE_LIMIT + 1)].map(() => ({
              account: user.address,
              amount: ONE_TOKEN,
            }));

            await expect(token.transferBatch(batch)).to.be.revertedWith(
              `BatchSizeTooLarge(${BATCH_SIZE_LIMIT}, ${batch.length})`,
            );
          });
        });
      });

      context('transferFromBatch', () => {
        context('when allowance is enough', () => {
          beforeEach(async () => {
            await token.approve(user.address, await token.balanceOf(admin.address));
          });

          context('when token holder has enough tokens', () => {
            it('works', async () => {
              const signers = (await ethers.getSigners()).slice(1, BATCH_SIZE + 1);
              const payees = signers.map(x => ({ account: x.address, amount: ONE_TOKEN }));

              await expect(() => token.connect(user).transferFromBatch(admin.address, payees))
                .to.emit(token, 'Transfer')
                .withArgs(admin.address, payees[0].account, payees[0].amount)
                .to.emit(token, 'Transfer')
                .withArgs(admin.address, payees[1].account, payees[1].amount)
                .to.emit(token, 'Transfer')
                .withArgs(admin.address, payees[2].account, payees[2].amount)
                .to.emit(token, 'Transfer')
                .withArgs(admin.address, payees[3].account, payees[3].amount)
                .to.emit(token, 'Transfer')
                .withArgs(admin.address, payees[4].account, payees[4].amount)
                .changeTokenBalances(
                  token,
                  [admin, ...signers],
                  [-ONE_TOKEN * BigInt(BATCH_SIZE), ...payees.map(x => x.amount)],
                );
            });
          });

          context('when holder does not have enough tokens', () => {
            beforeEach(async () => {
              await token.approve(user.address, ONE_TOKEN * 1_000_000n);
            });

            it('reverts', async () => {
              await expect(
                token
                  .connect(user.address)
                  .transferFromBatch(admin.address, [{ account: user.address, amount: ONE_TOKEN * 1_000_000n }]),
              ).to.be.revertedWith(`ERC20: transfer amount exceeds balance`);
            });
          });

          context('when sender sends tokens to zero address', () => {
            it('reverts', async () => {
              await expect(
                token
                  .connect(user.address)
                  .transferFromBatch(admin.address, [{ account: AddressZero, amount: ONE_TOKEN }]),
              ).to.be.revertedWith(`ERC20: transfer to the zero address`);
            });
          });

          context('when batch size is too large', () => {
            it('reverts', async () => {
              const batch: GameToken.PayeeStruct[] = [...Array(BATCH_SIZE_LIMIT + 1)].map(() => ({
                account: user.address,
                amount: ONE_TOKEN,
              }));

              await expect(token.transferFromBatch(admin.address, batch)).to.be.revertedWith(
                `BatchSizeTooLarge(${BATCH_SIZE_LIMIT}, ${batch.length})`,
              );
            });
          });
        });

        context('when allowance is not enough', () => {
          beforeEach(async () => {
            await token.approve(user.address, ONE_TOKEN);
          });
          context('when token holder has enough tokens', () => {
            it('reverts', async () => {
              const payees = (await ethers.getSigners())
                .slice(0, BATCH_SIZE)
                .map(x => ({ account: x.address, amount: ONE_TOKEN }));

              await expect(token.connect(user).transferFromBatch(admin.address, payees)).to.be.revertedWith(
                `ERC20: insufficient allowance`,
              );
            });
          });
        });
      });
    });

    context('permit', () => {
      it('allows', async () => {
        const permit = await signERC2612Permit(
          admin,
          token.address,
          admin.address,
          user.address,
          ONE_TOKEN.toString(10),
        );

        await token.permit(admin.address, user.address, ONE_TOKEN, permit.deadline, permit.v, permit.r, permit.s, {
          gasLimit: 1000000,
        });

        await expect(token.allowance(admin.address, user.address)).eventually.to.eq(ONE_TOKEN);
        await expect(token.nonces(admin.address)).eventually.to.eq(1);
      });
    });
  });
}
