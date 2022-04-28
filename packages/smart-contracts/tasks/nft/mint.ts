import { task, types } from 'hardhat/config';

export const TASK_MINT_NFT = 'tx:mint-nft';

task(TASK_MINT_NFT, 'Mint NFT')
  .addParam('nft', 'NFT Contract Address', undefined, types.string)
  .addParam('to', 'Target address', undefined, types.string)
  .setAction(async ({ nftBox, to }, { ethers }) => {
    const [operator] = await ethers.getSigners();

    const factory = await ethers.getContractFactory('NFT', operator);
    const contract = factory.attach(nftBox);
    const tx = await contract.mint(to);

    console.log(`Transaction: ${tx.hash}`);

    const receipt = await tx.wait();

    const events = await contract.queryFilter(contract.filters.Transfer(), receipt.blockNumber);
    events.filter(x => x.transactionHash === tx.hash).forEach(({ args }) => console.log(`Token ID: ${args!.tokenId}`));
  });

export {};
