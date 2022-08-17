import { task, types } from 'hardhat/config';

export const TASK_NFT_BATCH_TRANSFER = 'tx:nft-batch-transfer';

task(TASK_NFT_BATCH_TRANSFER, 'NFT Batch Transfer')
  .addParam('nft', 'NFT Contract Address', undefined, types.string)
  .addParam('from', 'From Address', undefined, types.string)
  .addParam('to', 'To Address', undefined, types.string)
  .addParam('tokenIds', 'Comma-separated tokenIds', undefined, types.string)
  .setAction(async ({ nft, from, to, tokenIds }, { ethers }) => {
    const [operator] = await ethers.getSigners();

    const factory = await ethers.getContractFactory('NFT', operator);
    const contract = factory.attach(nft);
    const tx = await contract.batchTransfer(
      from,
      to,
      tokenIds.split(',').map((e: string) => e.trim()),
    );

    console.log(`Transaction: ${tx.hash}`);

    const receipt = await tx.wait();
    if (receipt.status !== 1) {
      throw new Error(`Transaction ${tx.hash} failed!`);
    }
  });

export {};
