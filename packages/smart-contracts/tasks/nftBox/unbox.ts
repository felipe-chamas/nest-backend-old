import { task, types } from 'hardhat/config';

export const TASK_NFT_BOX_UNBOX = 'tx:nft-box-unbox';

task(TASK_NFT_BOX_UNBOX, 'Unbox NFT Box')
  .addParam('nftUnboxing', 'NFT Unboxing Contract Address', undefined, types.string)
  .addParam('requestId', 'Chainlink Request ID', undefined, types.string)
  .addParam('nfts', 'NFT Tokens to mint', undefined, types.string)
  .addParam('tokenCount', 'Tokens to mint', undefined, types.string)
  .setAction(async ({ nftUnboxing, requestId, nfts, tokenCount }, { ethers }) => {
    const [operator] = await ethers.getSigners();

    const factory = await ethers.getContractFactory('NFTUnboxing', operator);
    const contract = factory.attach(nftUnboxing);
    const tokens = nfts.split(',');
    const counts = tokenCount.split(',');

    if (tokens.length !== counts.length) throw new Error(`--nft length does not match --token-count length`);
    const tx = await contract.completeUnboxing(requestId, tokens, counts);
    console.log(`Transaction: ${tx.hash}`);

    const receipt = await tx.wait();

    const events = await contract.queryFilter(contract.filters.Unboxed(), receipt.blockNumber);
    events
      .filter(x => x.transactionHash === tx.hash)
      .forEach(({ args }) => {
        for (let i = 0; i < args.nfts.length; i++) {
          const nft = args.nfts[i];
          console.log(`NFT: ${nft}`);
          const minted = args.mintedTokenIds[i];
          for (let j = 0; j < minted.length; j++) {
            console.log(`\t\tTokenID: ${minted[j]}`);
          }
        }
      });
  });

export {};
