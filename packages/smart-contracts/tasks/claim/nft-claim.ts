import { task, types } from 'hardhat/config';
import { createNFTClaimMerkleTree, createNFTClaimMerkleTreeLeaf } from '../../scripts/utils';
import csv from 'csvtojson';
import { writeFileSync } from 'fs';
import path from 'path';

export const TASK_GENERATE_NFT_CLAIM_MERKLE_TREE = 'generate:nft-claim-merkle-tree';

task(TASK_GENERATE_NFT_CLAIM_MERKLE_TREE, 'Generate Merkle Tree for NFT Claim')
  .addParam('nftClaimContract', 'NFT Claim Contract Address', undefined, types.string)
  .addParam('file', 'CSV File (account, tokens)', undefined, types.string)
  .addOptionalParam('output', 'Output file', undefined, types.string)
  .setAction(async ({ nftClaimContract, file, output }, { ethers }) => {
    const chainId = (await ethers.provider.getNetwork()).chainId;

    const list = await csv().fromFile(file);
    const tree = createNFTClaimMerkleTree(chainId, nftClaimContract, list);

    const result = {
      root: tree.getHexRoot(),
      proofs: list.reduce((acc, cur) => {
        acc[cur.account] = {
          tokens: cur.tokens,
          proof: tree.getHexProof(createNFTClaimMerkleTreeLeaf(chainId, nftClaimContract, cur.account, cur.tokens)),
        };
        return acc;
      }, {}),
    };
    writeFileSync(output ?? path.parse(file).name + '_output.json', JSON.stringify(result));
  });

export {};
