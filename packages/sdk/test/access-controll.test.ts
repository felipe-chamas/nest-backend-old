import { AccountId } from 'caip';
import { BigNumber, ContractReceipt } from 'ethers';
import {
  GeneralError, Role, ErrorCodes, Roles,
} from '../';
import { expect, prepareTestContext, TestContext, wait } from './utils';

describe('AccessControl service', () => {
  let ctx: TestContext;
  beforeEach(async () => { ctx = await prepareTestContext(); });
  describe('when minter role granted to anon/anon2', () => {
    let minters: AccountId[];
    beforeEach('grantRole', async () => {
      minters = [...ctx.minters];
      for (const actor of [ctx.anon, ctx.anon2]) {
        await wait(
          ctx.admin.accessControl.grantRole(actor.accountId, Roles.Minter),
        );
        minters.push(actor.accountId);
      }
    });
    describe('when minter role is revoked from anon', () => {
      let txHash: string;
      beforeEach('revokeRole', async () => {
        const receipt = await ctx.admin.accessControl.revokeRole(
          ctx.anon.accountId, Roles.Minter,
        );
        txHash = receipt.hash;
      });
      describe('fetchEvents', () => {
        it('captures revoke event', async () => {
          const events = await ctx.anon.utils.fetchEvents(
            txHash, ctx.acl, 'ACL', 'RoleRevoked',
          );
          expect(events).to.have.lengthOf(1);
          expect(events[0].account).eql(ctx.anon.accountId);
          expect(events[0].role).equals(Roles.Minter);
          expect(events[0].sender).eql(ctx.admin.accountId);
        });
      });
    });
    describe('getRoleMemberCount', () => {
      it('returns minter count', async () => {
        const membersCount = await ctx.admin.accessControl
          .getRoleMemberCount(Roles.Minter);
        expect(membersCount).equals(BigNumber.from(minters.length));
      });
    });
    describe('getNthRoleMember', () => {
      it('fetches all minters', async () => {
        for (let i = 0; i < minters.length; i++) {
          const minter = await ctx.anon.accessControl.getNthRoleMember(
            Roles.Minter, i,
          );
          expect(minter).eql(minters[i]);
        }
      });
    });
    describe('listByRole', () => {
      it('returns slice of members', async () => {
        const expectedSlice = minters.slice(1);
        const actualSlice = await ctx.anon.accessControl.listByRole(
          Roles.Minter,
          { offset: 1, limit: 100 },
        );
        expect(expectedSlice.length).equals(actualSlice.length);
        for (let i = 0; i < actualSlice.length; i++) {
          expect(actualSlice[i]).eql(expectedSlice[i]);
        }
      });
    });
  });
  describe('hasRole', () => {
    describe('when role exist', () => {
      it('returns true if address has it', async () => {
        await expect(ctx.anon.accessControl.hasRole(
          ctx.admin.accountId,
          Roles.Admin,
        )).to.eventually.be.true;
      });
      it('returns false if address does not have it', async () => {
        await expect(ctx.anon.accessControl.hasRole(
          ctx.admin.accountId,
          Roles.Minter,
        )).to.eventually.be.false;
      });
    });
    describe('when role does not exist', () => {
      it('fails', async () => {
        const unknownRole = 'unknownRole';
        await expect(ctx.anon.accessControl.hasRole(
          ctx.admin.accountId,
          unknownRole as Role,
        ))
          .to.eventually.be.rejectedWith(GeneralError)
          .to.have.property('errorCode', ErrorCodes.role_not_exist);
      });
    });
  });
  describe('renounce', () => {
    describe('when operator role is renounced from operator', () => {
      let receipt: ContractReceipt;
      beforeEach('renounceRole', async () => {
        receipt = await wait(ctx.operator.accessControl.renounceRole(
          ctx.operator.accountId,
          Roles.Operator,
        ));
      });
      describe('fetchEvents', () => {
        it('returns correct event', async () => {
          const events = await ctx.operator.utils.fetchEvents(
            receipt.transactionHash,
            ctx.acl,
            'ACL',
            'RoleRevoked',
          );
          expect(events.length).equals(1);
          expect(events[0].sender).eql(ctx.operator.accountId);
          expect(events[0].role).equals(Roles.Operator);
          expect(events[0].account).eql(ctx.operator.accountId);
        });
      });
      describe('hasRole', () => {
        it('returns false', async () => {
          await expect(ctx.operator.accessControl.hasRole(
            ctx.operator.accountId,
            Roles.Operator,
          )).to.eventually.be.false;
        });
      });
    });
    describe("when renouncing other's role", () => {
      it('fails', async () => {
        await expect(wait(ctx.admin.accessControl.renounceRole(
          ctx.operator.accountId,
          Roles.Operator,
        )))
          .to.eventually.rejectedWith(GeneralError)
          .to.have.property('errorCode', ErrorCodes.renounce_only_self);
      });
    });
  });
  describe('grantRole', () => {
    describe('when provided role does not exist', () => {
      it('fails', async () => {
        const unknownRole = 'no_such_role_exist';
        await expect(wait(ctx.admin.accessControl.grantRole(
          ctx.anon.accountId,
          unknownRole as Role,
        )))
          .to.eventually.be.rejectedWith(GeneralError, unknownRole)
          .with.property('errorCode', ErrorCodes.role_not_exist);
      });
    });
  });
});
