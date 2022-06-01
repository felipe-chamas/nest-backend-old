import { wait, expect, TestContext, prepareTestContext } from './utils';
import { AccountId } from 'caip';
import { BigNumber } from 'ethers';

describe('NFTUnbox service', () => {
  let ctx: TestContext;
  beforeEach(async () => {
    ctx = await prepareTestContext();
  });

  describe('unboxing process', () => {
    let boxId: BigNumber;
    beforeEach('mint to anon a box token', async () => {
      await wait(ctx.minter.boxNft.mintToken(ctx.anon.accountId));
      const balance = await ctx.anon.boxNft.getOwnBalance();
      expect(balance).to.eq(1);
      boxId = await ctx.anon.boxNft.getOwnTokenByIndex(0);
    });
    describe('when unbox request submitted', () => {
      let requestId: BigNumber;
      beforeEach('submit request to unbox', async () => {
        const receipt = await wait(ctx.anon.nftUnbox.requestUnboxing(boxId));
        const events = await ctx.anon.utils.fetchEvents(
          receipt.transactionHash,
          ctx.nftUnbox,
          'NFTUnboxing',
          'UnboxingRequested',
        );
        expect(events).to.have.lengthOf(1);
        expect(events[0].tokenId).to.equal(boxId);
        requestId = events[0].requestId;
      });
      describe('fetch token/box info', () => {
        it('return box id by request id', async () => {
          const result = await ctx.anon.nftUnbox.getBoxIdByRequestId(requestId);
          expect(result).equals(boxId);
        });
        it('return token id by box id', async () => {
          const result = await ctx.anon.nftUnbox.getRequestIdByBoxId(boxId);
          expect(result).equals(requestId);
        });
      });
      describe('when random request fulfilled', () => {
        let randomWord: BigNumber;
        beforeEach('fulfill random request', async () => {
          const receipt = await wait(
            ctx.vrfCoordinator.fulfillRandomWords(
              requestId,
              ctx.nftUnbox.address,
            ),
          );
          const events = await ctx.anon.utils.fetchEvents(
            receipt.transactionHash,
            ctx.nftUnbox,
            'NFTUnboxing',
            'UnboxingRandomReceived',
          );
          expect(events).to.have.lengthOf(1);
          const event = events[0];
          expect(event.requestId).equals(requestId);
          expect(event.tokenId).equals(boxId);
          randomWord = event.randomWord;
          expect(randomWord).to.exist;
        });
        describe('fetch random result', () => {
          it('returns generated random by box id', async () => {
            const result = await ctx.anon.nftUnbox.getGeneratedRandomByBoxId(
              boxId,
            );
            expect(result).equals(randomWord);
          });
          it('returns generated random by request id', async () => {
            const result =
              await ctx.anon.nftUnbox.getGeneratedRandomByRequestId(requestId);
            expect(result).equals(randomWord);
          });
        });
        let nftAccountIds: AccountId[];
        let tokenCounts: number[];
        describe('when unbox request completed', async () => {
          let mintedTokenIds: BigNumber[][];
          beforeEach('init arguments for comlete call', () => {
            nftAccountIds = [ctx.nft];
            tokenCounts = [4];
            expect(nftAccountIds.length).equals(tokenCounts.length);
          });
          beforeEach('complete unbox request', async () => {
            const receipt = await wait(
              ctx.operator.nftUnbox.completeUnboxing(
                requestId,
                nftAccountIds,
                tokenCounts,
              ),
            );
            const events = await ctx.anon.utils.fetchEvents(
              receipt.transactionHash,
              ctx.nftUnbox,
              'NFTUnboxing',
              'Unboxed',
            );
            expect(events).to.have.lengthOf(1);
            const event = events[0];
            expect(event.nfts).to.have.lengthOf(nftAccountIds.length);
            expect(event.mintedTokenIds).to.have.lengthOf(tokenCounts.length);
            for (const [idx, ids] of event.mintedTokenIds.entries()) {
              expect(ids).to.have.lengthOf(tokenCounts[idx]);
            }
            for (const [idx, nft] of event.nfts.entries()) {
              expect(nft).eql(nftAccountIds[idx]);
            }
            expect(event.requestId).equals(requestId);
            expect(event.tokenId).equals(boxId);
            mintedTokenIds = event.mintedTokenIds;
          });
          describe('nft balance', () => {
            it('contains minted nft', async () => {
              for (let i = 0; i < tokenCounts.length; i++) {
                const nft = await ctx.anon.sdk.nft(nftAccountIds[i]);
                const balance = await nft.getOwnBalance();
                expect(balance).equals(tokenCounts[i]);
                for (const mintedTokenId of mintedTokenIds[i]) {
                  const owner = await nft.getOwnerOfToken(mintedTokenId);
                  expect(owner.address).equals(ctx.anon.accountId.address);
                }
              }
            });
          });
        });
      });
    });
  });
});
