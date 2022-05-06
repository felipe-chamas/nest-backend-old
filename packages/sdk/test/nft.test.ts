import {
  createSdk,
  Roles,
  NFT,
  AccessControl,
  Utils,
} from '../';

import {
  runDeployTask,
  expect,
} from './utils';
import * as hre from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { AccountId } from 'caip';
import { BigNumber } from 'ethers';

interface ActorScope {
  signerAddress: AccountId;
  nft: NFT;
  accessControl: AccessControl;
  utils: Utils;
}

describe('nft functionality', () => {

  const nftName = 'NFT';
  const nftSymbol = 'nft';
  const nftMaxSupply = '5';
  const nftBaseUri = 'nft base uri';

  let admin: ActorScope;
  let operator: ActorScope;
  let minter: ActorScope;
  let anon: ActorScope;

  let accessControlAddress: string;
  let nftAddress: string;


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
  }


  async function prepareActorScope(
    signer: SignerWithAddress,
  ): Promise<ActorScope> {
    const sdk = await createSdk(signer);
    const utils = sdk.utils;
    return {
      nft: await sdk.createNFT(utils.createAccountIdFromAddress(nftAddress)),
      accessControl: sdk.createAccessControl(accessControlAddress),
      utils,
      signerAddress: utils.createAccountIdFromAddress(signer.address),
    };
  }

  async function prepareContext() {
    const [
      adminSigner,
      operatorSigner,
      minterSigner,
      anonSigner,
    ] = await hre.ethers.getSigners();
    await prepareContracts(
      adminSigner.address,
      operatorSigner.address,
    );
    admin = await prepareActorScope(adminSigner);
    operator = await prepareActorScope(operatorSigner);
    anon = await prepareActorScope(anonSigner);
    minter = await prepareActorScope(minterSigner);
    // extra contract configuration
    await (await admin.accessControl.grantRole(
      minter.signerAddress,
      Roles.Minter,
    )).wait();
  }

  beforeEach('prepare context', prepareContext);

  it('gets meta info', async () => {
    const metaInfo = operator.nft.tokenMetaInfo;
    expect(metaInfo.name).equals(nftName);
    expect(metaInfo.symbol).equals(nftSymbol);
    expect(metaInfo.maxTokenSupply.toString())
      .equals(BigNumber.from(nftMaxSupply).toString());
  });

  it(
    'provides basic operations related to balance, owner of token' +
    ', minting, burning, baseUri, tokenUri, transfer ',
    async () => {
      // check balance before any operation
      const balanceBefore = await anon.nft.getBalance(anon.signerAddress);
      expect(balanceBefore.toString()).equals(BigNumber.from(0).toString());
      // mint token
      const tx = await minter.nft.mintToken(anon.signerAddress);
      await tx.wait();

      // fetch event of minted token
      const events = await anon.utils.fetchEvents(
        tx.hash,
        nftAddress,
        'NFT',
        'Transfer',
      );
      expect(events).to.have.length(1);
      // get minted token id
      const tokenId = events[0].tokenId;
      // check owner of token
      await expect(anon.nft.getOwnerOfToken(tokenId))
        .to.eventually.fulfilled
        .and.to.have.property('address', anon.signerAddress.address);

      // set token uri
      const newTokenUri = 'new token uri';
      await (await operator.nft.setTokenURI(tokenId, newTokenUri)).wait();
      // and check token uri
      const baseToken = await anon.nft.getBaseTokenURI();
      await expect(admin.nft.getTokenURI(tokenId))
        .to.eventually.equals(baseToken + newTokenUri);
      // set base token uri
      const newBaseUri = 'new base token uri';
      await (await operator.nft.setBaseTokenURI(newBaseUri)).wait();
      // check that base token was changed
      await expect(anon.nft.getBaseTokenURI())
        .to.eventually.equals(newBaseUri);

      // transfer to admin checking transferFrom
      await (await anon.nft.transferFrom(
        anon.signerAddress,
        admin.signerAddress,
        tokenId,
      )).wait();

      // check balance of admin
      let balance = await admin.nft.getOwnBalance();
      expect(balance.toString()).equals('1');

      // transfer back to anon checking transfer
      await (await admin.nft.transfer(anon.signerAddress, tokenId)).wait();

      // check balance of admin
      balance = await admin.nft.getOwnBalance();
      expect(balance.toString()).equals('0');

      // check balance of anon
      balance = await anon.nft.getOwnBalance();
      expect(balance.toString()).equals('1');

      // burn
      await (await minter.nft.burnToken(tokenId)).wait();

      // check balance of anon
      balance = await anon.nft.getOwnBalance();
      expect(balance.toString()).equals('0');
    },
  );

  describe('approve', () => {

    it('approve single token', async () => {
      // mint token to anon
      await (await minter.nft.mintToken(anon.signerAddress)).wait();
      // check isApprovedOrOwner
      const tokenId = await minter.nft.getTokenByIndex(0);
      await expect(anon.nft.isApprovedOrOwner(anon.signerAddress, tokenId))
        .to.eventually.be.true;
      // check that there is no approved operator yet
      let address = await admin.nft.getApprovedOperator(tokenId);
      expect(address.address).equals(hre.ethers.constants.AddressZero);
      await expect(anon.nft.isApprovedOrOwner(admin.signerAddress, tokenId))
        .to.eventually.be.false;
      // grant approval for admin
      await (await anon.nft.approveOperator(admin.signerAddress, tokenId))
        .wait();
      // check that admin is approved operator
      address = await admin.nft.getApprovedOperator(tokenId);
      expect(address.address).equals(admin.signerAddress.address);
      await expect(admin.nft.isApprovedOrOwner(admin.signerAddress, tokenId))
        .to.eventually.be.true;
      // disapprove admin
      await (await anon.nft.unapproveOperator(tokenId)).wait();
      // check that admin can not manage
      await expect(admin.nft.isApprovedOrOwner(admin.signerAddress, tokenId))
        .to.eventually.be.false;
      // approve again
      await (await anon.nft.approveOperator(admin.signerAddress, tokenId))
        .wait();
      // ckeck that admin has 0 on balance
      let balance = await admin.nft.getOwnBalance();
      expect(balance.toString()).equals('0');
      // send from anon to admin by admin
      await (await admin.nft.transferFrom(
        anon.signerAddress,
        admin.signerAddress,
        tokenId,
      )).wait();
      // check admin balance
      balance = await admin.nft.getOwnBalance();
      expect(balance.toString()).equals('1');
    });

    it('approve all tokens', async () => {
      // mint 2 token to anon
      await (await minter.nft.mintToken(anon.signerAddress)).wait();
      await (await minter.nft.mintToken(anon.signerAddress)).wait();
      const tokenIds = await minter.nft.listTokensByOwner(anon.signerAddress);
      // check that there is no approvedAll operator yet
      await expect(admin.nft.isOperatorApprovedForAllTokens(
        anon.signerAddress,
        admin.signerAddress,
      )).to.eventually.be.false;
      // grant approvalAll for admin
      await (await anon.nft.toggleApprovedOperatorForAllTokens(
        admin.signerAddress, true,
      )).wait();
      // check that admin is approvedAll operator
      await expect(admin.nft.isOperatorApprovedForAllTokens(
        anon.signerAddress,
        admin.signerAddress,
      )).to.eventually.be.true;
      // send one token to operator
      await (await admin.nft.transferFrom(
        anon.signerAddress,
        operator.signerAddress,
        tokenIds[0],
      )).wait();
      // check operator balance
      const balance = await operator.nft.getOwnBalance();
      expect(balance.toString()).to.equal('1');
      // remove operator from approvedAll
      await (await anon.nft.toggleApprovedOperatorForAllTokens(
        admin.signerAddress, false,
      )).wait();
      // check is admin approved for all
      await expect(admin.nft.isOperatorApprovedForAllTokens(
        anon.signerAddress,
        admin.signerAddress,
      )).to.eventually.be.false;
    });

  });

  it('provides enumerate operations', async () => {
      const anonTokens: string[] = [];
      const adminTokens: string[] = [];

      // mint some tokens
      for (let i = 0; i < 4; i++) {
        let to = admin;
        let saveTo = adminTokens;
        if (i === 2) {
          to = anon;
          saveTo = anonTokens;
        }
        const tx = await minter.nft.mintToken(to.signerAddress);
        await tx.wait();
        const tokenId = (await anon.utils.fetchEvents(
          tx.hash, nftAddress, 'NFT', 'Transfer',
        ))[0].tokenId;
        saveTo.push(tokenId.toString());
        // check that tokenId exist
        await expect(anon.nft.getOwnerOfToken(tokenId))
          .to.eventually.have.property('address', to.signerAddress.address);
      }
      expect(adminTokens.length).equals(3);
      expect(anonTokens.length).equals(1);


      // get token total supply
      const totalSupply = await minter.nft.getTokenTotalSupply();
      expect(totalSupply.toString()).to.equals('4');

      // get 3-rd item of admin
      let token = await admin.nft.getTokenOfOwnerByIndex(
        admin.signerAddress,
        2,
      );
      expect(token.toString()).to.equals(adminTokens[2]);

      // get 4-th item
      token = await admin.nft.getTokenByIndex(3);
      expect(token.toString()).to.equals(adminTokens[2]);

      // list tokens of admin with pagination
      let tokens = await admin.nft.listOwnTokens({
        fromIndex: 1,
        toIndex: 2,
      });
      expect(tokens).to.be.length(2);
      expect(tokens[0].toString()).equals(adminTokens[1]);
      expect(tokens[1].toString()).equals(adminTokens[2]);

      // list all tokens
      tokens = await admin.nft.listAllTokens({
        fromIndex: 3,
        toIndex: 5,
      });
      expect(tokens).to.be.length(1);
      expect(tokens[0].toString()).to.equal(adminTokens[2]);
  });

});
