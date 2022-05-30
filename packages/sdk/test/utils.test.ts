import { wait, expect, TestContext, prepareTestContext } from './utils';
import { ContractReceipt } from 'ethers';
import { ErrorCodes, GeneralError, Roles } from '../dist/sdk';

describe('Utils service', () => {
  let ctx: TestContext;
  beforeEach(async () => {
    ctx = await prepareTestContext();
  });
  describe('when role is granted', () => {
    let receipt: ContractReceipt;
    beforeEach('grantRole', async () => {
      receipt = await wait(
        ctx.admin.accessControl.grantRole(ctx.anon.accountId, Roles.Operator)
      );
    });
    describe('fetchEvents', () => {
      it('returns role granted event', async () => {
        const events = await ctx.anon.utils.fetchEvents(
          receipt.transactionHash,
          ctx.acl,
          'ACL',
          'RoleGranted'
        );
        expect(events.length).equals(1);
        expect(events[0].role).equals(Roles.Operator);
        expect(events[0].sender).eql(ctx.admin.accountId);
        expect(events[0].account).eql(ctx.anon.accountId);
      });
    });
    describe('when no event matches', () => {
      it('returns empty array', async () => {
        const events = await ctx.anon.utils.fetchEvents(
          receipt.transactionHash,
          ctx.gameToken,
          'ACL',
          'RoleGranted'
        );
        expect(events.length).equals(0);
      });
    });
    describe('when called with unsupported event/contract', () => {
      it('fails', async () => {
        await expect(
          ctx.anon.utils.fetchEvents(
            receipt.transactionHash,
            ctx.acl,
            'NotExistedContract' as 'ACL', // ask for non existing contract
            'RoleRevoked'
          )
        )
          .to.eventually.rejectedWith(GeneralError)
          .to.have.property('errorCode', ErrorCodes.not_supported_event);
      });
      it('fails', async () => {
        await expect(
          ctx.anon.utils.fetchEvents(
            receipt.transactionHash,
            ctx.acl,
            'ACL',
            'Unboxed' as 'RoleGranted' // ask for non existing contract
          )
        )
          .to.eventually.rejectedWith(GeneralError)
          .to.have.property('errorCode', ErrorCodes.not_supported_event);
      });
    });
  });
});
