import { expect, TestContext, prepareTestContext } from './utils';
import { CHAIN_STANDARD, ErrorCodes, GeneralError } from '../';
import { AccountId, ChainId } from 'caip';


describe('SignerUtils', () => {
  let ctx: TestContext;
  beforeEach(async () => { ctx = await prepareTestContext(); });
  describe('getSignerChainId', () => {
    it('returns chain id of a signer', async () => {
      expect(await ctx.anon.signerUtils.getSignerChainId())
        .equals('' + await ctx.anon.signer.getChainId());
    });
  });
  describe('parseAddress', () => {
    const address = '0x8ba1f109551bD432803012645Ac136ddd64DBA72';
    let accountId: AccountId;
    beforeEach('create accountId', async () => {
      accountId = new AccountId({
        address,
        chainId: new ChainId({
          namespace: CHAIN_STANDARD,
          reference: '' + await ctx.anon.signer.getChainId(),
        }),
      });
    });
    it('returns address', async () => {
      const address = await ctx.anon.signerUtils.parseAddress(accountId);
      expect(address).equals(address);
    });
    describe('when called with unsupported chain standard', () => {
      beforeEach('change chain standard unsupported', () => {
        accountId.chainId.namespace = 'solana';
      });
      it('fails', async () => {
        await expect(ctx.anon.signerUtils.parseAddress(accountId))
          .to.eventually.rejectedWith(GeneralError)
          .to.have.property(
            'errorCode',
            ErrorCodes.unsupported_chain_standard,
          );
      });
    });
    describe("When called with chain id, different from signer's", () => {
      beforeEach('change chain id', () => {
        accountId.chainId.reference = '987654';
      });
      it('fails', async () => {
        await expect(ctx.anon.signerUtils.parseAddress(accountId))
          .to.eventually.rejectedWith(GeneralError)
          .to.have.property(
            'errorCode',
            ErrorCodes.accounts_not_on_the_same_chain,
          );
      });
    });
    describe('When address field is not in correct format', () => {
      it('fails', async () => {
        const incorrectAddresses = [
          '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', // checksum is wrong
          '12345678910',
          '',
        ];
        for (const word of incorrectAddresses) {
          accountId.address = word;
          await expect(ctx.anon.signerUtils.parseAddress(accountId))
            .to.eventually.rejected;
        }
      });
    });
  });
  describe('getProvider', () => {
    it ('returns provider', async () => {
      const reply = ctx.anon.signerUtils.getProvider();
      expect(reply).to.exist;
      expect(reply).equals(ctx.anon.signerUtils.signer.provider);
    });
  });
  describe('createAccountIdFromAddress', () => {
    it(
      'Creates AccountId based on provided address and the signer',
      async () => {
        const address = '0x8ba1f109551bD432803012645Ac136ddd64DBA72';
        const accountId = await ctx.anon.signerUtils
          .createAccountIdFromAddress(address);
        expect(accountId.address).equals(address);
        expect(accountId.chainId.namespace).equals(CHAIN_STANDARD);
        expect(accountId.chainId.reference).equals(
          '' + await ctx.anon.signerUtils.signer.getChainId(),
        );
      },
    );
  });
});
