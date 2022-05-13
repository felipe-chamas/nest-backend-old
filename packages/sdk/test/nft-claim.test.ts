import {
  wait, expect, TestContext,
  prepareTestContext, sizeOfOne,
} from './utils';
import { BigNumber, ContractReceipt, ContractTransaction } from 'ethers';
import {
  ErrorCodes, NFTClaimData, NFTClaimProof,
  GeneralError,
} from '../dist/sdk';
import MerkleTree from 'merkletreejs';

describe('NFTClaim service', () => {
  let ctx: TestContext;
  beforeEach(async () => { ctx = await prepareTestContext(); });
  describe('when merkleTree is created', () => {
    const tokensPerAccount = 3;
    const tokensPerAccountBN = BigNumber.from(tokensPerAccount);
    let claims: NFTClaimData[];
    let merkleTree: MerkleTree;
    beforeEach('createMerkleTreeFromClaims', async () => {
      claims = [
        {
          accountId: ctx.anon.accountId,
          tokenCount: tokensPerAccountBN,
        },
        {
          accountId: ctx.anon2.accountId,
          tokenCount: tokensPerAccountBN,
        },
      ];
      merkleTree = await ctx.anon.nftClaim
        .createMerkleTreeFromClaims(claims);
    });

    describe('submitNewMerkleRoot', () => {
      it('emits MerkleRootAdded', async () => {
        const receipt = await wait(
          ctx.operator.nftClaim.submitNewMerkleRoot(merkleTree.getHexRoot()),
        );
        const event = await sizeOfOne(ctx.anon.utils.fetchEvents(
          receipt.transactionHash,
          ctx.nftClaim, 'NFTClaim', 'MerkleRootAdded',
        ));
        expect(event.merkleRoot).equals(merkleTree.getHexRoot());
      });
    });

    describe('when merkleTree is created and submitted in single step', () => {
      let submittedMerkleTree: MerkleTree;
      let submitTransaction: ContractTransaction;
      beforeEach('createAndSubmitMerkleTreeFromClaims', async () => {
        [submittedMerkleTree, submitTransaction] = await ctx.operator.nftClaim
          .createAndSubmitMerkleTreeFromClaims(claims);
        await expect(submitTransaction.wait()).to.eventually.fulfilled;
      });

      describe('createAndSubmitMerkleTreeFromClaims', () => {
        it('emits MerkleRootAdded', async () => {
          const event = await sizeOfOne(ctx.anon.utils.fetchEvents(
            submitTransaction.hash, ctx.nftClaim, 'NFTClaim', 'MerkleRootAdded',
          ));
          expect(event.merkleRoot).equals(merkleTree.getHexRoot());
        });
      });


      describe('claim proving process', () => {

        describe('when claim is created', () => {
          let claimData: NFTClaimData;
          let claimProof: NFTClaimProof;
          beforeEach('createClaimProof', async () => {
            claimData = claims[1];
            claimProof = await ctx.anon.nftClaim.createClaimProof({
              merkleTree: submittedMerkleTree,
              claimData,
            });
          });

          describe('isClaimProofAllowed', () => {
            it('returns true', async () => {
              await expect(ctx.anon.nftClaim.isClaimProofAllowed(claimProof))
                .to.eventually.be.true;
            });
          });

          describe('when same claim is created and submitted', () => {
            let receipt: ContractReceipt;
            beforeEach('createAndSubmitClaimProof', async () => {
              receipt = await wait(
                ctx.anon.nftClaim.createAndSubmitClaimProof({
                  merkleTree: submittedMerkleTree,
                  claimData,
                }),
              );
            });
            it('createAndSubmitClaimProof emits TokenClaimed', async () => {
              const events = await ctx.anon.utils.fetchEvents(
                receipt.transactionHash, ctx.nftClaim,
                'NFTClaim', 'TokenClaimed',
              );
              expect(events).to.have.lengthOf(tokensPerAccount);
              for (const event of events) {
                expect(event.account).eql(claimData.accountId);
                expect(event.merkleRoot)
                  .equals(submittedMerkleTree.getHexRoot());
              }
            });
            describe('when claim proof is not valid', () => {
              let claimProofInvalid: NFTClaimProof;
              beforeEach('compose invalid proof', () => {
                claimProofInvalid = {
                  ...claimProof,
                  claim: {
                    ...claimProof.claim,
                    accountId: ctx.admin.accountId,
                  },
                };
              });
              describe('isClaimProofAllowed', () => {
                it('returns false', async () => {
                  await expect(
                    ctx.anon.nftClaim.isClaimProofAllowed(claimProofInvalid),
                  ).to.eventually.be.false;
                });
              });
            });
            describe('when submitting proof second time', () => {
              describe('createAndSubmitClaimProof', () => {
                it('rejects', async () => {
                  await expect(wait(
                    ctx.anon.nftClaim.createAndSubmitClaimProof({
                      claimData, merkleTree: submittedMerkleTree,
                    }),
                  ))
                    .to.eventually.rejectedWith(GeneralError)
                    .to.have.property('errorCode', ErrorCodes.nft_claim_error);
                });
              });
            });
          });
        });
      });
    });
  });
});

