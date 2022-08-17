import { task, types } from 'hardhat/config';

export const TASK_NFT_LAUNCHPAD_BATCH_MINT = 'tx:nft-batch-mint';

task(TASK_NFT_LAUNCHPAD_BATCH_MINT, 'NFT Launchpad Batch Mint')
  .addParam('nftLaunchpad', 'NFT Launchpad Contract Address', undefined, types.string)
  .addParam('to', 'To Address', undefined, types.string)
  .addParam('size', 'Number of NFTs to mint', undefined, types.string)
  .setAction(async ({ nftLaunchpad, to, size }, { ethers }) => {
    const [operator] = await ethers.getSigners();

    const factory = await ethers.getContractFactory('NFTLaunchpad', operator);
    const contract = factory.attach(nftLaunchpad);

    const launchpad = await contract.launchpad();

    if (launchpad !== operator.address) {
      throw new Error(`Only launchpad can mintTo`);
    }

    const tx = await contract.mintTo(to, size);

    console.log(`Transaction: ${tx.hash}`);

    const receipt = await tx.wait();
    if (receipt.status !== 1) {
      throw new Error(`Transaction ${tx.hash} failed!`);
    }
  });

export {};
