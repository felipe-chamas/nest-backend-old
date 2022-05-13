import { wait, expect, TestContext, prepareTestContext } from './utils';
import { BigNumber } from 'ethers';


describe('NFT service', () => {
  let ctx: TestContext;
  beforeEach(async () => { ctx = await prepareTestContext(); });
  describe('tokenMetaInfo', () => {
    it('returns data that nft was initialized with', () => {
      expect(ctx.anon.nft.tokenMetaInfo.name).equals(ctx.nftConfig.name);
      expect(ctx.anon.nft.tokenMetaInfo.symbol).equals(ctx.nftConfig.symbol);
    });
  });
  describe('when token is minted', () => {
    let tokenId: BigNumber;
    beforeEach('`mint` token to anon', async () => {
      const receipt = await wait(
        ctx.minter.nft.mintToken(ctx.anon.accountId),
      );
      const mintEvent = (await ctx.anon.utils.fetchEvents(
        receipt.transactionHash, ctx.nft, 'NFT', 'Transfer',
      ))[0];
      expect(mintEvent).to.exist;
      tokenId = mintEvent.tokenId;
      expect(mintEvent.to).eql(ctx.anon.accountId);
    });
    describe('transfer', () => {
      beforeEach('transfer token to anon2', async () => {
        await wait(ctx.anon.nft.transfer(ctx.anon2.accountId, tokenId));
      });
      describe('when token is transfered', () => {
        describe("receiver/sender's balance", () => {
          it('changes', async () => {
            const anonBalance = await ctx.anon.nft
              .getBalance(ctx.anon.accountId);
            const anon2Balance = await ctx.anon.nft
              .getBalance(ctx.anon2.accountId);
            expect(anonBalance).equals(0);
            expect(anon2Balance).equals(1);
          });
        });
      });
    });
    describe('getBalance', () => {
      it('returns correct balance', async () => {
        const balance = await ctx.anon.nft.getBalance(ctx.anon.accountId);
        expect(balance).equals(1);
      });
    });
    describe('getOwnBalance', () => {
      it('returns correct balance', async () => {
        const balance = await ctx.anon.nft.getOwnBalance();
        expect(balance).equals(1);
      });
    });
    describe('getOwnerOfToken', () => {
      it('returns owner of token', async () => {
        const owner = await ctx.anon.nft.getOwnerOfToken(tokenId);
        expect(owner).eql(ctx.anon.accountId);
      });
    });
    describe('when base token uri is set', () => {
      const baseUrl = 'baseTokenURI';
      beforeEach('setBaseTokenURI', async () => {
        await wait(ctx.operator.nft.setBaseTokenURI(baseUrl));
      });
      describe('getBaseTokenURI', () => {
        it('returns correct base token uri', async () => {
          const reply = await ctx.anon.nft.getBaseTokenURI();
          expect(reply).equals(baseUrl);
        });
      });
      describe('when token uri is set', () => {
        const tokenUrl = 'tokenUrl';
        beforeEach('setTokenURI', async () => {
          await wait(ctx.operator.nft.setTokenURI(tokenId, tokenUrl));
        });
        describe('getTokenURI', () => {
          it('return token URI', async () => {
            const reply = await ctx.anon.nft.getTokenURI(tokenId);
            expect(reply).equals(baseUrl + tokenUrl);
          });
        });
      });
    });
    describe('when token is burned', () => {
      beforeEach('burnToken', async () => {
        await wait(ctx.minter.nft.burnToken(tokenId));
      });
      describe('getOwnBalance', () => {
        it('returns zero-balance', async () => {
          const balance = await ctx.anon.nft.getOwnBalance();
          expect(balance).equals(0);
        });
      });
    });
    describe('when anon allows anon2 to manage a token', () => {
      beforeEach('`approveOperator` on anon2', async () => {
        await wait(
          ctx.anon.nft.approveOperator(ctx.anon2.accountId, tokenId),
        );
      });
      describe('isApprovedOrOwner', () => {
        it('returns true for anon as an owner', async () => {
          const reply = await ctx.anon.nft.isApprovedOrOwner(
            ctx.anon2.accountId, tokenId,
          );
          expect(reply).to.be.true;
        });
        it('returns true for anon2 as token operator', async () => {
          const reply = await ctx.anon.nft.isApprovedOrOwner(
            ctx.anon.accountId, tokenId,
          );
          expect(reply).to.be.true;
        });
      });
      describe('getApprovedOperator', () => {
        it('returns anon2 as an approved operator', async () => {
          const reply = await ctx.anon.nft.getApprovedOperator(tokenId);
          expect(reply).eql(ctx.anon2.accountId);
        });
      });
      describe('transferFrom', () => {
        describe('when anon2 transfersFrom anon => anon2', () => {
          beforeEach('`transferFrom` token', async () => {
            await wait(ctx.anon2.nft.transferFrom(
              ctx.anon.accountId, ctx.anon2.accountId, tokenId,
            ));
          });
          describe('receiver/sender balances', () => {
            it('changes', async () => {
              let reply = await ctx.anon.nft.getBalance(ctx.anon.accountId);
              expect(reply).equals(0);
              reply = await ctx.anon.nft.getBalance(ctx.anon2.accountId);
              expect(reply).equals(1);
            });
          });
        });
      });
      describe('when anon unapproves anyone from token', () => {
        beforeEach('unapproveOperator', async () => {
          await wait(ctx.anon.nft.unapproveOperator(tokenId));
        });
        describe('isApprovedOrOwner', () => {
          it('returns false for anon2', async () => {
            const reply = await ctx.admin.nft.isApprovedOrOwner(
              ctx.anon2.accountId, tokenId,
            );
            expect(reply).to.be.false;
          });
        });
      });
    });
  });
  describe('when list of token is minted', () => {
    const tokenCount = 5;
    let tokens: BigNumber[];
    beforeEach('`mint` the list of tokens to anon', async () => {
      tokens = [];
      for (let i = 0; i < tokenCount; i++) {
        const receipt = await wait(
          ctx.minter.nft.mintToken(ctx.anon.accountId),
        );
        const mintEvent = (await ctx.anon.utils.fetchEvents(
          receipt.transactionHash, ctx.nft, 'NFT', 'Transfer',
        ))[0];
        expect(mintEvent).to.exist;
        const tokenId = mintEvent.tokenId;
        tokens.push(tokenId);
        expect(mintEvent.to).eql(ctx.anon.accountId);
      }
    });
    describe('when anon2 is approved for all tokens', () => {
      beforeEach('toggleApprovedOperatorForAllTokens on anon2', async () => {
        await wait(ctx.anon.nft.toggleApprovedOperatorForAllTokens(
          ctx.anon2.accountId,
          true,
        ));
      });
      describe('isOperatorApprovedForAllTokens', () => {
        it('returns true for anon2', async () => {
          const reply = await ctx.anon2.nft.isOperatorApprovedForAllTokens(
            ctx.anon.accountId,
            ctx.anon2.accountId,
          );
          expect(reply).equals(true);
        });
      });
      describe('when anon2 sends all token from anon => anon2', () => {
        beforeEach('anon2 `transferFrom` all tokens', async () => {
          for (let i = 0; i < tokenCount; i++) {
            await wait(ctx.anon2.nft.transferFrom(
              ctx.anon.accountId, ctx.anon2.accountId, tokens[i],
            ));
          }
        });
        describe('anon/anon2 balances', () => {
          it('changes', async () => {
            let reply = await ctx.anon.nft.getBalance(ctx.anon.accountId);
            expect(reply).equals(0);
            reply = await ctx.anon.nft.getBalance(ctx.anon2.accountId);
            expect(reply).equals(tokenCount);
          });
        });
      });
      describe('when anon2 is unapproved from all tokens', () => {
        beforeEach('unapprove', async () => {
          await wait(ctx.anon.nft.toggleApprovedOperatorForAllTokens(
            ctx.anon2.accountId,
            false,
          ));
        });
        describe('isOperatorApprovedForAllTokens', () => {
          it('returns false for anon2', async () => {
            const reply = await ctx.anon2.nft.isOperatorApprovedForAllTokens(
              ctx.anon.accountId,
              ctx.anon2.accountId,
            );
            expect(reply).equals(false);
          });
        });
      });
    });
    describe('Enumerate operations', () => {
      let anon2Tokens: BigNumber[];
      const anon2TokenCount = 6;
      let allTokens: BigNumber[];
      beforeEach('mint list of tokens to anon2', async () => {
        anon2Tokens = [];
        for (let i = 0; i < anon2TokenCount; i++) {
          const receipt = await wait(
            ctx.minter.nft.mintToken(ctx.anon2.accountId),
          );
          const mintEvent = (await ctx.anon.utils.fetchEvents(
            receipt.transactionHash, ctx.nft, 'NFT', 'Transfer',
          ))[0];
          expect(mintEvent).to.exist;
          const tokenId = mintEvent.tokenId;
          anon2Tokens.push(tokenId);
          expect(mintEvent.to).eql(ctx.anon2.accountId);
        }
        allTokens = [...tokens, ...anon2Tokens];
      });
      describe('getTokenTotalSupply', () => {
        it('returns total amount of tokens', async () => {
          const reply = await ctx.anon.nft.getTokenTotalSupply();
          expect(reply).equals(anon2TokenCount + tokenCount);
        });
      });
      describe('getTokenByIndex', () => {
        it('returns every token that was previously created', async () => {
          for (let i = 0; i < anon2TokenCount + tokenCount; i++) {
            const item = await ctx.anon.nft.getTokenByIndex(i);
            expect(item).equals(allTokens[i]);
          }
        });
      });
      describe('listAllTokens', () => {
        describe('when no pagination provided', () => {
          it('returns all tokens', async () => {
            const reply = await ctx.anon.nft.listAllTokens();
            expect(reply.length).equals(allTokens.length);
          });
        });
        it('returns slice of tokens', async () => {
          const expected = allTokens.slice(2, 5);
          const reply = await ctx.anon.nft.listAllTokens({
            limit: 3, offset: 2,
          });
          expect(reply.length).equals(expected.length);
          for (let i = 0; i < reply.length; i++)
            expect(reply[i]).equals(expected[i]);
        });
      });
      describe('getTokenOfOwnerByIndex', () => {
        it('returns each of anon2 tokens', async () => {
          for (let i = 0; i < anon2TokenCount; i++) {
            const item = await ctx.anon2.nft.getTokenOfOwnerByIndex(
              ctx.anon2.accountId, i,
            );
            expect(item).equals(anon2Tokens[i]);
          }
        });
      });
      describe('getOwnTokenByIndex', () => {
        it("returns each of anon's own tokens", async () => {
          for (let i = 0; i < tokenCount; i++)
            expect(await ctx.anon.nft.getOwnTokenByIndex(i)).equals(tokens[i]);
        });
      });
      describe('listTokensByOwner', () => {
        it("returns owner's tokens with pagination", async () => {
          const expected = tokens.slice(3);
          const items = await ctx.anon.nft.listTokensByOwner(
            ctx.anon.accountId,
            { offset: 3, limit: 5 },
          );
          expect(expected.length).equals(items.length);
          for (let i = 0; i < expected.length; i++)
            expect(expected[i]).equals(items[i]);
        });
      });
      describe('listOwnTokens', () => {
        it('returns own tokens with pagination', async () => {
          const expected = anon2Tokens.slice(1, 4);
          const items = await ctx.anon2.nft
            .listOwnTokens({ limit: 3, offset: 1 });
          expect(items.length).equals(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(items[i]).equals(expected[i]);
          }
        });
      });
    });
  });
});
