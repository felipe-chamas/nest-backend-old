import { ContractTransaction } from 'ethers';
import { ethers } from 'hardhat';
import { MerkleTree } from 'merkletreejs';
import { ERC721Upgradeable, NFTUnboxing, TokenSale, VRFCoordinatorV2Mock } from '../../typechain';

export const getTransferEvent = async (tx: ContractTransaction, erc721: ERC721Upgradeable) => {
  const receipt = await tx.wait();
  const events = await erc721.queryFilter(erc721.filters.Transfer(), receipt.blockNumber);
  return events[0].args;
};

export const getRoundAdded = async (tx: ContractTransaction, tokenSale: TokenSale) => {
  const receipt = await tx.wait();
  const events = await tokenSale.queryFilter(tokenSale.filters.RoundAdded(), receipt.blockNumber);
  return events[0].args;
};

export const evmSnapshot = () => ethers.provider.send('evm_snapshot', []);
export const evmRevert = (id: string) => ethers.provider.send('evm_revert', [id]);
export const nextBlock = (timestamp = 0) => ethers.provider.send('evm_mine', timestamp > 0 ? [timestamp] : []);
export const increaseTime = async (seconds: number): Promise<void> => {
  const time = await currentTime();
  await nextBlock(time + seconds);
};
export const setNextBlockTimestamp = (timestamp: number) =>
  ethers.provider.send('evm_setNextBlockTimestamp', [timestamp]);

export const currentTime = async (): Promise<number> => {
  const block = await ethers.provider.getBlock('latest');
  return block.timestamp;
};

export const mineBlocks = (count: number) => ethers.provider.send('hardhat_mine', [BigInt(count).toString(16)]);

export const createAllowlistMerkleTree = (chainid: number, contract: string, accounts: string[]) => {
  if (accounts.length < 2) throw new Error('At least two accounts must be specified!');
  const leaves = accounts.map(x => createMerkleTreeLeaf(chainid, contract, x));
  return new MerkleTree(leaves, ethers.utils.keccak256, { sort: true });
};

export const createMerkleTreeLeaf = (chainid: number, contract: string, account: string) =>
  ethers.utils.solidityKeccak256(['uint256', 'address', 'address'], [chainid, contract, account]);

export const getSubscriptionCreatedEvent = async (tx: ContractTransaction, coordinator: VRFCoordinatorV2Mock) => {
  const receipt = await tx.wait();
  const events = await coordinator.queryFilter(coordinator.filters.SubscriptionCreated(), receipt.blockNumber);
  return events[0].args;
};

export const getUnboxedEvent = async (tx: ContractTransaction, nftUnboxing: NFTUnboxing) => {
  const receipt = await tx.wait();
  const events = await nftUnboxing.queryFilter(nftUnboxing.filters.Unboxed(), receipt.blockNumber);
  return events[0].args;
};
