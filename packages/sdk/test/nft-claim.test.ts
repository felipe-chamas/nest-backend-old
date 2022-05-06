import {
  createSdk,
  Roles,
  NFT,
  AccessControl,
  Utils,
  NFTClaim,
  NFTClaimData,
} from '../';

import {
  runDeployTask,
  expect,
  awaitTx,
} from './utils';
import * as hre from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { AccountId } from 'caip';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

interface ActorScope {
  signerAddress: AccountId;
  nft: NFT;
  nftClaim: NFTClaim;
  accessControl: AccessControl;
  utils: Utils;
  signer: SignerWithAddress;
}

type CreateClaimsArgs = [amount: number, perAddressTokenCount: number];

describe('nft claim functionality', () => {

  const nftName = 'NFT';
  const nftSymbol = 'nft';
  const nftMaxSupply = 100;
  const nftBaseUri = 'nft base uri';

  let admin: ActorScope;
  let operator: ActorScope;
  let anons: ActorScope[];

  let accessControlAddress: string;
  let nftAddress: string;
  let nftClaimAddress: string;


  async function prepareContracts(
    admin: string,
    operator: string,
  ) {
    accessControlAddress = await runDeployTask(
      'acl',
      { admin: admin, operator: operator },
    );
    nftAddress = await runDeployTask(
      'nft',
      {
        acl: accessControlAddress,
        name: nftName,
        symbol: nftSymbol,
        baseUri: nftBaseUri,
        maxTokenSupply: nftMaxSupply,
        burnEnabled: true,
      },
    );
    nftClaimAddress = await runDeployTask(
      'nft-claim',
      { acl: accessControlAddress, nft: nftAddress },
    );
  }


  async function prepareActorScope(
    signer: SignerWithAddress,
  ): Promise<ActorScope> {
    const sdk = await createSdk(signer);
    const utils = sdk.utils;
    return {
      nft: await sdk.createNFT(utils.createAccountIdFromAddress(nftAddress)),
      accessControl: sdk.createAccessControl(accessControlAddress),
      signer,
      nftClaim: sdk.createNFTClaim(
        utils.createAccountIdFromAddress(nftClaimAddress),
      ),
      utils,
      signerAddress: utils.createAccountIdFromAddress(signer.address),
    };
  }

  async function prepareContext() {
    const [
      adminSigner,
      operatorSigner,
      ...others
    ] = await hre.ethers.getSigners();
    await prepareContracts(
      adminSigner.address,
      operatorSigner.address,
    );
    admin = await prepareActorScope(adminSigner);
    operator = await prepareActorScope(operatorSigner);
    anons = [];
    for (let i = 0; i < others.length; i++) {
      const scope = await prepareActorScope(others[i]);
      anons.push(scope);
    }
    // grant miner to nft claim contract
    await awaitTx(admin.accessControl.grantRole(
      nftClaimAddress,
      Roles.Minter,
    ));
  }

  beforeEach('prepare context', prepareContext);

  function createClaims(...[amount, perAddressAmount]: CreateClaimsArgs) {
    const claims: NFTClaimData[] = anons.slice(0, amount)
      .map(x => ({
        accountId: x.signerAddress,
        tokenCount: BigNumber.from(perAddressAmount),
      }));
    return claims;
  }

  async function createAndSubmitClaims(
    scope: ActorScope,
    ...args: CreateClaimsArgs
  ) {
    const claims = createClaims(...args);
    const [tree, tx] = await scope.nftClaim
      .createAndSubmitMerkleTreeFromClaims(claims);
    await tx.wait();
    // check that new merkel root event was emmited
    const event = (await admin.utils.fetchEvents(
      tx.hash,
      nftClaimAddress,
      'NFTClaim',
      'MerkleRootAdded',
    ))[0];
    const treeRoot = tree.getHexRoot();
    expect(event.merkleRoot).equals(treeRoot);
    return {
      claims,
      root: treeRoot,
      tree,
      leaves: tree.getHexLeaves(),
    };
  }


  it('creates merkel tree and submit in a 2 steps', async () => {
    // generate claims
    const claims = createClaims(3, 2);
    // create & submit tree root in 2 steps
    const tree = operator.nftClaim.createMerkleTreeFromClaims(claims);
    const receipt = await awaitTx(
      operator.nftClaim.submitNewMerkleRoot(tree.getHexRoot()),
    );
    // check that new merkel root event was emmited
    const event = (await admin.utils.fetchEvents(
      receipt.transactionHash,
      nftClaimAddress,
      'NFTClaim',
      'MerkleRootAdded',
    ))[0];
    expect(event.merkleRoot).equals(tree.getHexRoot());
  });

  it('creates and submits new merkel tree in a single step', async () => {
    await createAndSubmitClaims(operator, 4, 2);
  });

  it('create and submit claim proof', async () => {
    // set actor
    const anon = anons[0];
    const tokenAmountPerAddress = 1;
    const claimsCount = 2;
    const {
      claims, leaves, tree, root,
    } = await createAndSubmitClaims(
      operator,
      claimsCount,
      tokenAmountPerAddress,
    );
    const { tree: anotherTree } = await createAndSubmitClaims(
      operator,
      claimsCount,
      tokenAmountPerAddress + 1,
    );
    // get actors claim
    const anonClaim = claims[0];
    expect(anonClaim.accountId.address).equals(anon.signerAddress.address);
    // create claim proof
    const proofCreatedWithLeaves = admin.nftClaim.createClaimProof({
      claimData: anonClaim,
      merkleTreeLeaves: leaves,
    });
    const proofCreatedWithTree = operator.nftClaim.createClaimProof({
      claimData: anonClaim,
      merkleTree: tree,
    });
    const wrongProof = anon.nftClaim.createClaimProof({
      claimData: anonClaim,
      merkleTree: anotherTree,
    });
    // check proof validity
    await expect(anon.nftClaim.isClaimProofAllowed(proofCreatedWithTree))
      .to.eventually.be.true;
    await expect(admin.nftClaim.isClaimProofAllowed(proofCreatedWithLeaves))
      .to.eventually.be.true;
    await expect(admin.nftClaim.isClaimProofAllowed(wrongProof))
      .to.eventually.be.false;
    let balance = await anon.nft.getOwnBalance();
    expect(balance.toString()).equals('0');
    // submit claim proof
    const receipt = await awaitTx(
      admin.nftClaim.submitClaimProof(proofCreatedWithTree),
    );
    balance = await anon.nft.getOwnBalance();
    expect(balance.toString()).equals('1');
    // check that proof can not be submitted twice
    await expect(awaitTx(
      admin.nftClaim.submitClaimProof(proofCreatedWithTree),
    )).to.eventually.rejectedWith('ClaimingNotAllowed');
    await expect(anon.nftClaim.isClaimProofAllowed(proofCreatedWithLeaves))
      .to.eventually.be.false;
    // check if tokens where minted
    const events = await admin.utils.fetchEvents(
      receipt.transactionHash,
      nftAddress,
      'NFT',
      'Transfer',
    );
    expect(events).to.have.lengthOf(tokenAmountPerAddress);
    const tokenIds: string[] = [];
    for (const event of events) {
      expect(event.from.address).equals(ethers.constants.AddressZero);
      expect(event.to.address).equals(anon.signerAddress.address);
      expect(event.tokenId).exist;
      tokenIds.push(event.tokenId.toString());
    }
    // checks nft claim events
    const tokenClaimedEvents = await admin.utils.fetchEvents(
      receipt.transactionHash,
      nftClaimAddress,
      'NFTClaim',
      'TokenClaimed',
    );
    expect(tokenClaimedEvents).to.have.lengthOf(tokenAmountPerAddress);
    for (const event of tokenClaimedEvents) {
      expect(tokenIds).includes(event.tokenId.toString());
      expect(event.merkleRoot).equals(root);
      expect(event.account.address).equals(anon.signerAddress.address);
    }
  });

  it('create claim proof and submit in single call', async () => {
    const tokenPerAddressAmount = 6;
    const {
      claims, tree,
    } = await createAndSubmitClaims(operator, 2, tokenPerAddressAmount);
    const anon = anons[0];
    const claim = claims[0];
    await expect(awaitTx(operator.nftClaim.createAndSubmitClaimProof({
      claimData: claim,
      merkleTree: tree,
    }))).to.eventually.fulfilled;

    const balanceAfter = await anon.nft.getOwnBalance();
    expect(balanceAfter.toString()).equals(tokenPerAddressAmount.toString());
  });

});
