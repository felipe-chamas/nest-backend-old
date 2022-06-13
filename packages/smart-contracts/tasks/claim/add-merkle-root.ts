import { task, types } from 'hardhat/config';

export const TASK_GENERATE_NFT_CLAIM_ADD_MERKLE_TREE_ROOT = 'nft-claim:add-merkle-tree-root';

task(TASK_GENERATE_NFT_CLAIM_ADD_MERKLE_TREE_ROOT, 'Add Merkle Tree Root for NFT Claim')
  .addParam('nftClaimContract', 'NFT Claim Contract Address', undefined, types.string)
  .addParam('root', 'Merkle tree root', undefined, types.string)
  .addOptionalParam('gasLimit', 'Output file', undefined, types.string)
  .setAction(async ({ nftClaimContract, root, gasLimit }, { ethers }) => {
    const [operator] = await ethers.getSigners();

    const factory = await ethers.getContractFactory('NFTClaim', operator);

    const tx = await factory.attach(nftClaimContract).addMerkleRoot(root, { gasLimit });

    console.log(`Add Merkle Tree Root Transaction: ${tx.hash}`);
  });

export {};
