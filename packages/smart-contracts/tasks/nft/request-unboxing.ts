import { task, types } from 'hardhat/config';

export const TASK_NFT_BOX_REQUEST_UNBOXING = 'tx:request-nft-unboxing';

task(TASK_NFT_BOX_REQUEST_UNBOXING, 'Request NFT Box Unboxing')
  .addParam('nftUnboxing', 'NFT Unboxing Contract Address', undefined, types.string)
  .addParam('tokenId', 'NFT Box token id', undefined, types.string)
  .setAction(async ({ nftUnboxing, tokenId }, { ethers }) => {
    const [user] = await ethers.getSigners();

    const factory = await ethers.getContractFactory('NFTUnboxing', user);
    const contract = factory.attach(nftUnboxing);

    const tx = await contract.requestUnboxing(tokenId);

    console.log(`Transaction: ${tx.hash}`);

    const receipt = await tx.wait();

    const events = await contract.queryFilter(contract.filters.UnboxingRequested(), receipt.blockNumber);
    events
      .filter(x => x.transactionHash === tx.hash)
      .forEach(({ args }) => console.log(`Request ID: ${args!.requestId}`));
  });

export {};
