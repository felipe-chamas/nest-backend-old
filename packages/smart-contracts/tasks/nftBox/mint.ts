import { task, types } from 'hardhat/config';

export const TASK_MINT_NFT_BOX = 'tx:mint-nft-box';

task(TASK_MINT_NFT_BOX, 'Mint NFT Box')
  .addParam('nftUnboxing', 'NFT Unboxing Contract Address', undefined, types.string)
  .addParam('to', 'Target address', undefined, types.string)
  .setAction(async ({ nftBox, to }, { ethers }) => {
    const [operator] = await ethers.getSigners();

    const factory = await ethers.getContractFactory('NFTBox', operator);
    const contract = factory.attach(nftBox);
    const tx = await contract.mint(to);

    console.log(`Transaction: ${tx.hash}`);

    const receipt = await tx.wait();

    const events = await contract.queryFilter(contract.filters.Transfer(), receipt.blockNumber);
    events.filter(x => x.transactionHash === tx.hash).forEach(({ args }) => console.log(`Token ID: ${args.tokenId}`));
  });

export {};
