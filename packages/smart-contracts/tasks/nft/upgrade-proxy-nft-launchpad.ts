import { task, types } from 'hardhat/config';

export const TASK_NFT_LAUNCHPAD_UPGRADE_PROXY = 'tx:nft-launchpad-upgrade-proxy';

task(TASK_NFT_LAUNCHPAD_UPGRADE_PROXY, 'Upgrade NFT Launchpad Proxy')
  .addParam('nftLaunchpad', 'NFT Launchpad Contract Address', undefined, types.string)
  .setAction(async ({ nftLaunchpad }, { upgrades, ethers }) => {
    const [operator] = await ethers.getSigners();

    const NFTLaunchpadV2 = await ethers.getContractFactory('NFTLaunchpad', operator);
    const nftUpgraded = await upgrades.upgradeProxy(nftLaunchpad, NFTLaunchpadV2, {
      kind: 'uups',
    });

    console.log(`NFT proxy upgraded to: ${nftUpgraded.address}`);

    return nftUpgraded.address;
  });

export {};
