import { ContractTransaction } from 'ethers';
import { NFT } from '../../typechain';

export const getTransferEvent = async (tx: ContractTransaction, nft: NFT) => {
  const receipt = await tx.wait();
  const events = await nft.queryFilter(nft.filters.Transfer(), receipt.blockNumber);
  return events[0].args;
};
