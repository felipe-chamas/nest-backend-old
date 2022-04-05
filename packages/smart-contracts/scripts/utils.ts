import { ethers } from 'ethers';
import MerkleTree from 'merkletreejs';

export const createAllowlistMerkleTree = (chainid: number, contract: string, accounts: string[]) => {
  if (accounts.length < 2) throw new Error('At least two accounts must be specified!');
  const leaves = accounts.map(x => createAllowlistMerkleTreeLeaf(chainid, contract, x));
  return new MerkleTree(leaves, ethers.utils.keccak256, { sort: true });
};

export const createAllowlistMerkleTreeLeaf = (chainid: number, contract: string, account: string) =>
  ethers.utils.solidityKeccak256(['uint256', 'address', 'address'], [chainid, contract, account]);

export const createNFTClaimMerkleTree = (
  chainid: number,
  contract: string,
  claimList: { account: string; tokens: number }[],
) => {
  if (claimList.length < 2) throw new Error('At least two accounts must be specified!');
  const leaves = claimList.map(({ account, tokens }) =>
    createNFTClaimMerkleTreeLeaf(chainid, contract, account, tokens),
  );
  return new MerkleTree(leaves, ethers.utils.keccak256, { sort: true });
};

export const createNFTClaimMerkleTreeLeaf = (chainid: number, contract: string, account: string, tokens: number) =>
  ethers.utils.solidityKeccak256(['uint256', 'address', 'address', 'uint256'], [chainid, contract, account, tokens]);
