import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import MerkleTree from 'merkletreejs';
import { createNFTClaimMerkleTree, createNFTClaimMerkleTreeLeaf } from '../../../scripts/utils';
import { NFT, NFTClaim } from '../../../typechain';
import { EMPTY_MERKLE_ROOT } from '../../shared/constants';

export function shouldBehaveLikeNFTClaim() {
  let OPERATOR_ROLE: string;
  let nft: NFT;
  let nftClaim: NFTClaim;
  let stranger: SignerWithAddress;
  let other: SignerWithAddress;
  let user: SignerWithAddress;
  let operator: SignerWithAddress;
  let tree: MerkleTree;

  beforeEach(async function () {
    ({ nft, nftClaim } = this.contracts);
    ({ stranger, other, user, operator } = this.signers);
    ({ OPERATOR_ROLE } = this.roles);

    tree = createNFTClaimMerkleTree(await operator.getChainId(), nftClaim.address, [
      { account: other.address, tokens: 2 },
      { account: user.address, tokens: 2 },
    ]);
  });

  context('add merkle root', () => {
    context('when operator adds merkle root', () => {
      it('works', async () => {
        await expect(nftClaim.connect(operator).addMerkleRoot(tree.getHexRoot()))
          .to.emit(nftClaim, 'MerkleRootAdded')
          .withArgs(tree.getHexRoot());
      });
    });

    context('when stranger adds merkle root', () => {
      it('reverts', async () => {
        await expect(nftClaim.connect(stranger).addMerkleRoot(tree.getHexRoot())).to.revertedWith(
          `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`,
        );
      });
    });
  });

  context('when merkle root is added', () => {
    let root: string;
    let userProof: string[];
    beforeEach(async () => {
      root = tree.getHexRoot();
      await nftClaim.connect(operator).addMerkleRoot(root);
      const leaf = createNFTClaimMerkleTreeLeaf(await user.getChainId(), nftClaim.address, user.address, 2);
      userProof = tree.getHexProof(leaf);
    });

    context('when user claims tokens', () => {
      it('works', async () => {
        await expect(nftClaim.connect(user).claim(root, userProof, user.address, 2))
          .to.emit(nftClaim, 'TokenClaimed')
          .withArgs(user.address, root, 0)
          .emit(nftClaim, 'TokenClaimed')
          .withArgs(user.address, root, 1);
      });
    });

    context('when user claims tokens with invalid merkle root', () => {
      it('reverts', async () => {
        await expect(nftClaim.connect(user).claim(EMPTY_MERKLE_ROOT, userProof, user.address, 2)).to.revertedWith(
          'ClaimingNotAllowed()',
        );
      });
    });

    context('when user claims tokens with invalid merkle proof', () => {
      it('reverts', async () => {
        await expect(nftClaim.connect(user).claim(root, [], user.address, 2)).to.revertedWith('ClaimingNotAllowed()');
      });
    });

    context('when user claims tokens with invalid token count', () => {
      it('reverts', async () => {
        await expect(nftClaim.connect(user).claim(root, userProof, user.address, 100)).to.revertedWith(
          'ClaimingNotAllowed()',
        );
      });
    });

    context('when stranger claims tokens', () => {
      it('reverts', async () => {
        await expect(nftClaim.connect(stranger).claim(root, userProof, stranger.address, 2)).to.revertedWith(
          'ClaimingNotAllowed()',
        );
      });
    });
  });

  context('when multiple merkle roots are added', () => {
    const roots: string[] = [];
    const userProofs: string[][] = [];
    beforeEach(async () => {
      const chainId = await user.getChainId();
      roots.push(tree.getHexRoot());
      await nftClaim.connect(operator).addMerkleRoot(roots[0]);
      const leaf = createNFTClaimMerkleTreeLeaf(chainId, nftClaim.address, user.address, 2);
      userProofs.push(tree.getHexProof(leaf));

      const tree2 = createNFTClaimMerkleTree(chainId, nftClaim.address, [
        { account: other.address, tokens: 3 },
        { account: user.address, tokens: 3 },
      ]);

      roots.push(tree2.getHexRoot());
      await nftClaim.connect(operator).addMerkleRoot(roots[1]);

      const leaf2 = createNFTClaimMerkleTreeLeaf(chainId, nftClaim.address, user.address, 3);
      userProofs.push(tree2.getHexProof(leaf2));
    });

    context('when user claims tokens with first merkle root', () => {
      it('works', async () => {
        await expect(nftClaim.connect(user).claim(roots[0], userProofs[0], user.address, 2))
          .to.emit(nftClaim, 'TokenClaimed')
          .withArgs(user.address, roots[0], 0)
          .emit(nftClaim, 'TokenClaimed')
          .withArgs(user.address, roots[0], 1);
      });
    });

    context('when user claims tokens from first merkle root, then from second merkle root', () => {
      beforeEach(async () => {
        await nftClaim.connect(user).claim(roots[0], userProofs[0], user.address, 2);
      });

      it('works', async () => {
        await expect(nftClaim.connect(user).claim(roots[1], userProofs[1], user.address, 3))
          .to.emit(nftClaim, 'TokenClaimed')
          .withArgs(user.address, roots[1], 2)
          .emit(nftClaim, 'TokenClaimed')
          .withArgs(user.address, roots[1], 3)
          .emit(nftClaim, 'TokenClaimed')
          .withArgs(user.address, roots[1], 4);
        await expect(nft.balanceOf(user.address)).eventually.to.eq(5);
      });
    });

    context('when user claims tokens from seconds merkle root, then from first merkle root', () => {
      beforeEach(async () => {
        await nftClaim.connect(user).claim(roots[1], userProofs[1], user.address, 3);
      });

      it('works', async () => {
        await expect(nftClaim.connect(user).claim(roots[0], userProofs[0], user.address, 2))
          .to.emit(nftClaim, 'TokenClaimed')
          .withArgs(user.address, roots[0], 3)
          .emit(nftClaim, 'TokenClaimed')
          .withArgs(user.address, roots[0], 4);
        await expect(nft.balanceOf(user.address)).eventually.to.eq(5);
      });
    });

    context('when user claims tokens with invalid merkle root', () => {
      it('reverts', async () => {
        await expect(nftClaim.connect(user).claim(roots[1], userProofs[0], user.address, 2)).to.revertedWith(
          'ClaimingNotAllowed()',
        );
      });
    });

    context('when user claims tokens with invalid merkle proof', () => {
      it('reverts', async () => {
        await expect(nftClaim.connect(user).claim(roots[0], userProofs[1], user.address, 2)).to.revertedWith(
          'ClaimingNotAllowed()',
        );
      });
    });

    context('when user claims tokens with invalid token count', () => {
      it('reverts', async () => {
        await expect(nftClaim.connect(user).claim(roots[0], userProofs[0], user.address, 100)).to.revertedWith(
          'ClaimingNotAllowed()',
        );
      });
    });

    context('when user claims tokens with token count from another merkle proof', () => {
      it('reverts', async () => {
        await expect(nftClaim.connect(user).claim(roots[0], userProofs[0], user.address, 3)).to.revertedWith(
          'ClaimingNotAllowed()',
        );
      });
    });

    context('when stranger claims tokens', () => {
      it('reverts', async () => {
        await expect(nftClaim.connect(stranger).claim(roots[0], userProofs[0], stranger.address, 2)).to.revertedWith(
          'ClaimingNotAllowed()',
        );
      });
    });
  });
}
