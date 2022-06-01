import {
  wait,
  expect,
  TestContext,
  prepareTestContext,
  ONE_TOKEN,
  sizeOfOne,
} from './utils';
import { BigNumber, ContractReceipt } from 'ethers';
import {
  ERC20SignedApproval, ErrorCodes, GeneralError,
  Payee,
} from '../dist/sdk';
import { ethers } from 'hardhat';
import { AccountId } from 'caip';

describe('game-token functionality', () => {
  let ctx: TestContext;
  beforeEach(async () => {
    ctx = await prepareTestContext();
  });

  describe('allowance/approve', () => {
    const approveAmount = ONE_TOKEN.mul(10);
    const deadline = Math.round(Date.now() / 1000) + 60 * 60 * 24;
    describe('off-chain approves', () => {
      let approve: ERC20SignedApproval;
      beforeEach('create approval', async () => {
        approve = await ctx.admin.gameToken.createSignedApproval(
          ctx.anon.accountId,
          approveAmount,
          deadline,
        );
      });
      describe('when anon submits approval', () => {
        beforeEach('submit approval and check events', async () => {
          const receipt = await wait(
            ctx.anon.gameToken.submitSignedApproval(approve),
          );
          const event = await sizeOfOne(
            ctx.anon.utils.fetchEvents(
              receipt.transactionHash,
              ctx.gameToken,
              'GameToken',
              'Approval',
            ),
          );
          expect(event.owner).eql(ctx.admin.accountId);
          expect(event.value).equals(approveAmount);
          expect(event.spender).eql(ctx.anon.accountId);
        });
        describe('getAllowance', () => {
          it('returns approved allowance', async () => {
            const reply = await ctx.anon.gameToken.getAllowance(
              ctx.admin.accountId,
              ctx.anon.accountId,
            );
            expect(reply).equals(approveAmount);
          });
          describe('when called for non-approved account', () => {
            it('returns zero', async () => {
              const reply = await ctx.anon.gameToken.getAllowance(
                ctx.admin.accountId,
                ctx.admin.accountId,
              );
              expect(reply).equals(BigNumber.from(0));
            });
          });
        });
      });
    });
    describe('on-chain approves', () => {
      beforeEach('set initial anon approval and check emit', async () => {
        const receipt = await wait(
          ctx.admin.gameToken.approve(ctx.anon.accountId, approveAmount),
        );
        const event = await sizeOfOne(
          ctx.anon.utils.fetchEvents(
            receipt.transactionHash,
            ctx.gameToken,
            'GameToken',
            'Approval',
          ),
        );
        expect(event.spender).eql(ctx.anon.accountId);
        expect(event.value).equals(approveAmount);
      });
      describe('increaseAllowance', () => {
        const increaseByAmount = ONE_TOKEN.mul(5);
        const expectedAmount = approveAmount.add(increaseByAmount);
        it('emits Allowance event', async () => {
          const receipt = await wait(
            ctx.admin.gameToken.increaseAllowance(
              ctx.anon.accountId,
              increaseByAmount,
            ),
          );
          const event = await sizeOfOne(
            ctx.anon.utils.fetchEvents(
              receipt.transactionHash,
              ctx.gameToken,
              'GameToken',
              'Approval',
            ),
          );
          expect(event.value).equals(expectedAmount);
        });
      });
      describe('decreaseAllowance', () => {
        const decreaseByAmount = ONE_TOKEN.mul(3);
        const expectedAmount = approveAmount.sub(decreaseByAmount);
        it('emits Allowance event', async () => {
          const receipt = await wait(
            ctx.admin.gameToken.decreaseAllowance(
              ctx.anon.accountId,
              decreaseByAmount,
            ),
          );
          const event = await sizeOfOne(
            ctx.anon.utils.fetchEvents(
              receipt.transactionHash,
              ctx.gameToken,
              'GameToken',
              'Approval',
            ),
          );
          expect(event.value).equals(expectedAmount);
        });
      });
      describe('transferFrom', () => {
        const sendAmount = ONE_TOKEN.mul(3);
        let receipt: ContractReceipt;
        beforeEach('send token to anon2', async () => {
          receipt = await wait(
            ctx.anon.gameToken.transferFrom(
              ctx.admin.accountId,
              ctx.anon2.accountId,
              sendAmount,
            ),
          );
        });
        it('emits Transfer event', async () => {
          const event = await sizeOfOne(
            ctx.anon.utils.fetchEvents(
              receipt.transactionHash,
              ctx.gameToken,
              'GameToken',
              'Transfer',
            ),
          );
          expect(event.value).equals(sendAmount);
          expect(event.to).eql(ctx.anon2.accountId);
          expect(event.from).eql(ctx.admin.accountId);
        });
      });
      describe('burnTokenFrom', () => {
        const burnAmount = ONE_TOKEN.mul(2);
        let zeroAccountId: AccountId;
        let receipt: ContractReceipt;
        beforeEach('burn tokens from admin', async () => {
          receipt = await wait(
            ctx.anon.gameToken.burnTokenFrom(ctx.admin.accountId, burnAmount),
          );
        });
        beforeEach('createZeroAccountId', async () => {
          zeroAccountId = await ctx.anon.signerUtils.createAccountIdFromAddress(
            ethers.constants.AddressZero,
          );
        });
        it('emits Tansfer event', async () => {
          const event = await sizeOfOne(
            ctx.anon.utils.fetchEvents(
              receipt.transactionHash,
              ctx.gameToken,
              'GameToken',
              'Transfer',
            ),
          );
          expect(event.from).eql(ctx.admin.accountId);
          expect(event.value).equals(burnAmount);
          expect(event.to).eql(zeroAccountId);
        });
      });
      describe('transfer batch operations', () => {
        let payees: Payee[];
        let wrongPayees: Payee[];
        let amountMap: Map<string, BigNumber>;
        let uniquePayeesCount: number;
        let transferTx: ContractReceipt;
        beforeEach('init payees', () => {
          payees = [
            { amount: ONE_TOKEN.mul(1), accountId: ctx.anon2.accountId },
            { amount: ONE_TOKEN.mul(2), accountId: ctx.anon3.accountId },
            { amount: ONE_TOKEN.mul(1), accountId: ctx.anon2.accountId },
          ];
        });
        beforeEach('init wrongPayees', () => {
          wrongPayees = [
            // it's wrong because amount should be positive
            { accountId: ctx.anon2.accountId, amount: BigNumber.from(0) },
          ];
        });
        beforeEach('init amountMap & uniquePayeesCount', () => {
          amountMap = new Map();
          for (const payee of payees) {
            const address = payee.accountId.address;
            const before = amountMap.get(address) ?? BigNumber.from(0);
            const summed = before.add(payee.amount);
            amountMap.set(address, summed);
          }
          uniquePayeesCount = Array.from(amountMap.keys()).length;
        });
        async function checkNotMergedTransferEvents() {
          const events = await ctx.anon.utils.fetchEvents(
            transferTx.transactionHash, ctx.gameToken,
            'GameToken', 'Transfer',
          );
          expect(events).to.have.lengthOf(payees.length);
          for (let i = 0; i < events.length; i++) {
            expect(events[i].value).equals(payees[i].amount);
            expect(events[i].from).eql(ctx.admin.accountId);
            expect(events[i].to).eql(payees[i].accountId);
          }
        }
        async function checkMergedTransferEvents() {
          const events = await ctx.anon.utils.fetchEvents(
            transferTx.transactionHash, ctx.gameToken,
            'GameToken', 'Transfer',
          );
          expect(events).to.have.lengthOf(uniquePayeesCount);
          for (let i = 0; i < events.length; i++) {
            expect(events[i].from).eql(ctx.admin.accountId);
            expect(events[i].value)
              .equals(amountMap.get(events[i].to.address));
          }
        }
        describe('transferBatchFrom', () => {
          describe('when invalid amount is passed', () => {
            it('fails', async () => {
              await expect(wait(ctx.anon.gameToken.transferBatchFrom(
                ctx.admin.accountId, wrongPayees,
              )))
                .to.eventually.rejectedWith(GeneralError)
                .to.have.property('errorCode', ErrorCodes.bad_input);
            });
          });
          describe('anon `transferBatchFrom` admin to anon2, anon3', () => {
            describe('when `mergeDuplicates` is not set', () => {
              beforeEach('transfer tokens', async () => {
                transferTx = await wait(ctx.anon.gameToken.transferBatchFrom(
                  ctx.admin.accountId,
                  payees,
                ));
              });
              it('emits transfer events', checkNotMergedTransferEvents);
            });
            describe('when `mergeDuplicates` is set', () => {
              beforeEach('transfer tokens', async () => {
                transferTx = await wait(ctx.anon.gameToken.transferBatchFrom(
                  ctx.admin.accountId,
                  payees,
                  true,
                ));
              });
              it('emits transfer events', checkMergedTransferEvents);
            });
          });
        });
        describe('transferBatch', () => {
          describe('when invalid amount is passed', () => {
            it('fails', async () => {
              await expect(wait(ctx.admin.gameToken.transferBatch(
                wrongPayees,
              )))
                .to.eventually.rejectedWith(GeneralError)
                .to.have.property('errorCode', ErrorCodes.bad_input);
            });
          });
          describe('admin `transferBatch` to anon2, anon3', () => {
            describe('when `mergeDuplicates` is not set', () => {
              beforeEach('transfer tokens', async () => {
                transferTx = await wait(ctx.admin.gameToken.transferBatch(
                  payees,
                ));
              });
              it('emits transfer events', checkNotMergedTransferEvents);
            });
            describe('when `mergeDuplicates` is set', () => {
              beforeEach('transfer tokens', async () => {
                transferTx = await wait(ctx.admin.gameToken.transferBatch(
                  payees,
                  true,
                ));
              });
              it('emits transfer events', checkMergedTransferEvents);
            });
          });
        });
      });
    });
  });
  describe('transfer', () => {
    const transferAmount = ONE_TOKEN.mul(5);
    let receipt: ContractReceipt;
    beforeEach('make transfer to anon', async () => {
      receipt = await wait(
        ctx.admin.gameToken.transfer(ctx.anon.accountId, transferAmount),
      );
    });
    it('emits Transfer event', async () => {
      const event = await sizeOfOne(
        ctx.anon.utils.fetchEvents(
          receipt.transactionHash,
          ctx.gameToken,
          'GameToken',
          'Transfer',
        ),
      );
      expect(event.to).eql(ctx.anon.accountId);
      expect(event.from).eql(ctx.admin.accountId);
      expect(event.value).equals(transferAmount);
    });
    describe('getBalanceOf', () => {
      it('return transfered amount', async () => {
        const reply = await ctx.anon.gameToken.getBalanceOf(ctx.anon.accountId);
        expect(reply).equals(transferAmount);
      });
    });
    describe('recover process', () => {
      describe('when anon miss-transfer game tokens to contract', () => {
        let missTransferReceipt: ContractReceipt;
        beforeEach('transfers to contract and check emit ', async () => {
          missTransferReceipt = await wait(
            ctx.anon.gameToken.transfer(ctx.gameToken, transferAmount),
          );
          const event = await sizeOfOne(
            ctx.anon.utils.fetchEvents(
              missTransferReceipt.transactionHash,
              ctx.gameToken,
              'GameToken',
              'Transfer',
            ),
          );
          expect(event.to).eql(ctx.gameToken);
        });
        describe('recover', () => {
          it('emits Transfer event', async () => {
            const recoverReceipt = await wait(
              ctx.admin.gameToken.recover(
                ctx.gameToken,
                ctx.anon.accountId,
                transferAmount,
              ),
            );
            const event = await sizeOfOne(
              ctx.anon.utils.fetchEvents(
                recoverReceipt.transactionHash,
                ctx.gameToken,
                'GameToken',
                'Transfer',
              ),
            );
            expect(event.to).eql(ctx.anon.accountId);
            expect(event.value).equals(transferAmount);
          });
        });
      });
    });
  });
});
