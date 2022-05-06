import * as hre from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { runDeployTask, wait, expect, ONE_TOKEN } from './utils';
import { AccountId } from 'caip';
import {
  AccessControl, createSdk, Utils, Roles, NFTUnbox, typechain,
  NFT, SDK,
} from '..';
import { VRFCoordinatorV2Mock } from '@blockchain/smart-contracts/typechain';
import { BigNumber } from 'ethers';


interface Actor {
  signer: SignerWithAddress;
  accountId: AccountId;
  utils: Utils;
  accessControl: AccessControl;
  unbox: NFTUnbox;
  boxNft: NFT;
  unboxedNft: NFT;
  sdk: SDK
}

const vrfKeyHash =
  '0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314';

describe('NFTUnbox service', () => {
  let [admin, operator, anon]: Actor[] = [];
  let [
    aclAccountId, boxAccountId, nftAccountId,
    nftUnboxAccountId,
  ]: AccountId[] = [];
  let coordinator: VRFCoordinatorV2Mock;

  async function createActor(signer: SignerWithAddress) {
    const sdk = await createSdk(signer);
    const result: Actor = {
      signer,
      accountId: sdk.utils.createAccountIdFromAddress(signer.address),
      utils: sdk.utils,
      accessControl: sdk.createAccessControl(aclAccountId),
      unbox: sdk.createNFTUnbox(nftUnboxAccountId),
      boxNft: await sdk.createNFT(boxAccountId),
      unboxedNft: await sdk.createNFT(nftAccountId),
      sdk,
    };
    return result;
  }

  beforeEach('configure contracts, actors', async () => {
    const [_admin, _operator, _anon] = await hre.ethers.getSigners();
    const _aclAddress = await runDeployTask(
      'acl', { admin: _admin.address, operator: _operator.address },
    );
    const _boxAddress = await runDeployTask(
      'nft', {
        acl: _aclAddress, name: 'Box', symbol: 'box', burnEnabled: true,
      },
    );
    const _nftAddress = await runDeployTask(
      'nft', { acl: _aclAddress, name: 'NFT', symbol: 'nft' },
    );
    coordinator = await new typechain.VRFCoordinatorV2Mock__factory(_admin)
      .deploy(0, 0);
    const receipt = await wait(coordinator.createSubscription());
    const event = (await coordinator.queryFilter(
      coordinator.filters.SubscriptionCreated(),
      receipt.blockNumber,
    ))[0];
    await coordinator.fundSubscription(event.args.subId, ONE_TOKEN * 100n);
    expect(event).to.exist;
    const _nftUnboxAddress = await runDeployTask(
      'nft-box-unboxing',
      {
        acl: _aclAddress,
        nftBox: _boxAddress,
        vrfCoordinator: coordinator.address,
        keyHash: vrfKeyHash,
        requestConfirmations: 3,
        subscriptionId: event.args.subId.toString(),
        addToACL: true,
      },
    );
    const utils = (await createSdk(_admin)).utils;
    [aclAccountId, boxAccountId, nftAccountId, nftUnboxAccountId] = [
      _aclAddress,
      _boxAddress,
      _nftAddress,
      _nftUnboxAddress,
    ].map(x => utils.createAccountIdFromAddress(x));
    [admin, operator, anon] = await Promise.all(
      [_admin, _operator, _anon].map(createActor),
    );
    await wait(
      admin.accessControl.grantRole(admin.signer.address, Roles.Minter),
    );
  });

  describe('unboxing process', () => {
    let boxId: BigNumber;
    beforeEach('mint to anon a box token', async () => {
      await wait(admin.boxNft.mintToken(anon.accountId));
      const balance = await anon.boxNft.getOwnBalance();
      expect(balance).to.eq(1);
      boxId = await anon.boxNft.getOwnTokenByIndex(0);
    });
    describe('when unbox request submitted', () => {
      let requestId: BigNumber;
      beforeEach('submit request to unbox', async () => {
        const receipt = await wait(anon.unbox.requestUnboxing(boxId));
        const events = await anon.utils.fetchEvents(
          receipt.transactionHash,
          nftUnboxAccountId,
          'NFTUnboxing',
          'UnboxingRequested',
        );
        expect(events).to.have.lengthOf(1);
        expect(events[0].tokenId).to.equal(boxId);
        requestId = events[0].requestId;
      });
      describe('fetch token/box info', () => {
        it('return box id by request id', async () => {
          const result = await anon.unbox.getBoxIdByRequestId(requestId);
          expect(result).equals(boxId);
        });
        it('return token id by box id', async () => {
          const result = await anon.unbox.getRequestIdByBoxId(boxId);
          expect(result).equals(requestId);
        });
      });
      describe('when random request fulfilled', () => {
        let randomWord: BigNumber;
        beforeEach('fulfill random request', async () => {
          const receipt = await wait(coordinator.fulfillRandomWords(
            requestId,
            nftUnboxAccountId.address,
          ));
          const events = await anon.utils.fetchEvents(
            receipt.transactionHash,
            nftUnboxAccountId,
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
            const result = await anon.unbox.getGeneratedRandomByBoxId(boxId);
            expect(result).equals(randomWord);
          });
          it('returns generated random by request id', async () => {
            const result = await anon.unbox
              .getGeneratedRandomByRequestId(requestId);
            expect(result).equals(randomWord);
          });
        });
        let nftAccountIds: AccountId[];
        let tokenCounts: number[];
        describe('when unbox request completed', async () => {
          let mintedTokenIds: BigNumber[][];
          beforeEach('init arguments for comlete call', () => {
            nftAccountIds = [nftAccountId];
            tokenCounts = [4];
            expect(nftAccountIds.length).equals(tokenCounts.length);
          });
          beforeEach('complete unbox request', async () => {
            const receipt = await wait(operator.unbox.completeUnboxing(
              requestId,
              nftAccountIds,
              tokenCounts,
            ));
            const events = await anon.utils.fetchEvents(
              receipt.transactionHash,
              nftUnboxAccountId,
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
              expect(nft).equals(nftAccountIds[idx].address);
            }
            expect(event.requestId).equals(requestId);
            expect(event.tokenId).equals(boxId);
            mintedTokenIds = event.mintedTokenIds;
          });
          describe('nft balance', () => {
            it('contains minted nft', async () => {
              for (let i = 0; i < tokenCounts.length; i++) {
                const nft = await anon.sdk.createNFT(nftAccountIds[i]);
                const balance = await nft.getOwnBalance();
                expect(balance).equals(tokenCounts[i]);
                for (const mintedTokenId of mintedTokenIds[i]) {
                  const owner = await nft.getOwnerOfToken(mintedTokenId);
                  expect(owner.address).equals(anon.accountId.address);
                }
              }
            });
          });
        });
      });
    });
  });
});
