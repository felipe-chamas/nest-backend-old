import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import MerkleTree from 'merkletreejs';
import { beforeEach } from 'mocha';
import { createAllowlistMerkleTree, createAllowlistMerkleTreeLeaf } from '../../../../scripts/utils';
import { GameToken, TokenSale } from '../../../../typechain';
import { EMPTY_MERKLE_ROOT, ONE_TOKEN } from '../../../shared/constants';
import { currentTime, getRoundAdded } from '../../../shared/utils';

export function shouldBehaveLikeAllowlist() {
  const ROUND_CAP = 1000n * ONE_TOKEN;
  let OPERATOR_ROLE: string;
  let admin: SignerWithAddress;
  let operator: SignerWithAddress;
  let other: SignerWithAddress;
  let stranger: SignerWithAddress;
  let custody: SignerWithAddress;
  let tokenSale: TokenSale;
  let gameToken: GameToken;
  let roundIndex: number;
  beforeEach(async function () {
    ({ admin, operator, other, stranger, custody } = this.signers);
    ({ tokenSale, gameToken } = this.contracts);
    ({ OPERATOR_ROLE } = this.roles);

    await gameToken.connect(admin).transfer(custody.address, ROUND_CAP);
    await gameToken.connect(custody).approve(tokenSale.address, ROUND_CAP);

    const now = await currentTime();
    ({ index: roundIndex } = await getRoundAdded(
      await tokenSale.connect(operator).addRound(now + 10, 100, ONE_TOKEN, ROUND_CAP, EMPTY_MERKLE_ROOT),
      tokenSale,
    ));
  });

  context('add address', () => {
    context('when called by operator', () => {
      it('adds', async () => {
        await expect(tokenSale.connect(operator).addToAllowlist(roundIndex, [other.address]))
          .to.emit(tokenSale, 'AddedToAllowlist')
          .withArgs(roundIndex, other.address);
      });

      it('adds multiple addresses', async () => {
        await expect(tokenSale.connect(operator).addToAllowlist(roundIndex, [other.address, admin.address]))
          .to.emit(tokenSale, 'AddedToAllowlist')
          .withArgs(roundIndex, other.address)
          .to.emit(tokenSale, 'AddedToAllowlist')
          .withArgs(roundIndex, admin.address);
      });

      it('fails to add to invalid round', async () => {
        await expect(tokenSale.connect(operator).addToAllowlist(roundIndex + 1, [other.address])).to.be.revertedWith(
          `InvalidRoundIndex(${roundIndex + 1})`,
        );
      });
    });

    context('same address', () => {
      it('reverts single tx', async () => {
        await expect(
          tokenSale.connect(operator).addToAllowlist(roundIndex, [other.address, other.address]),
        ).to.be.revertedWith(`AlreadyInAllowlist("${other.address}")`);
      });

      it('reverts in two txs', async () => {
        await tokenSale.connect(operator).addToAllowlist(roundIndex, [other.address]);

        await expect(tokenSale.connect(operator).addToAllowlist(roundIndex, [other.address])).to.be.revertedWith(
          `AlreadyInAllowlist("${other.address}")`,
        );
      });
    });

    context('when called by stranger', () => {
      it('reverts', async () => {
        await expect(tokenSale.connect(stranger).addToAllowlist(roundIndex, [other.address])).to.be.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`,
        );
      });
    });
  });

  context('Merkle Tree', () => {
    let tree: MerkleTree;
    let leafFunction: (account: string) => string;
    beforeEach(async () => {
      const chainId = await admin.getChainId();
      tree = createAllowlistMerkleTree(chainId, tokenSale.address, [other.address, admin.address]);
      leafFunction = (account: string) => createAllowlistMerkleTreeLeaf(chainId, tokenSale.address, account);

      await tokenSale.connect(operator).setRoundMerkleRoot(roundIndex, tree.getHexRoot());
    });

    it('other address should be in allowlist', async () => {
      await expect(tokenSale.isAllowlisted(roundIndex, other.address, tree.getHexProof(leafFunction(other.address))))
        .eventually.to.be.true;
    });

    it('stranger address should not be in allowlist', async () => {
      await expect(tokenSale.isAllowlisted(roundIndex, stranger.address, [])).eventually.to.be.false;
    });
  });
}
