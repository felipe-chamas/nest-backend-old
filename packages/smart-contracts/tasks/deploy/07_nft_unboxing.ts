import { task, types } from 'hardhat/config';
import { NFTBoxUnboxingConstructor } from '../types';

export const TASK_DEPLOY_NFT_BOX_UNBOXING = 'deploy:nft-box-unboxing';

task(TASK_DEPLOY_NFT_BOX_UNBOXING, 'Deploy NFT Box Unboxing contract')
  .addParam('acl', 'ACL contract address', undefined, types.string)
  .addParam('nftBox', 'NFT Box contract', undefined, types.string)
  .addParam(
    'vrfCoordinator',
    'Chainlink VRF coordinator (see: "https://docs.chain.link/docs/vrf-contracts/#configurations")',
    undefined,
    types.string,
  )
  .addParam(
    'keyHash',
    'Chainlink VRF Key hash (see: "https://docs.chain.link/docs/vrf-contracts/#configurations")',
    undefined,
    types.string,
  )
  .addOptionalParam(
    'requestConfirmations',
    'The minimum number of confirmation blocks on VRF requests before oracles respond. Min: 3, Max: 200',
    3,
    types.int,
  )
  .addParam('subscriptionId', 'Chainlink VRF Subscription ID', undefined, types.string)
  .setAction(
    async (
      { acl, vrfCoordinator, keyHash, nftBox, subscriptionId, requestConfirmations }: NFTBoxUnboxingConstructor,
      { upgrades, ethers },
    ) => {
      const nftClaim = await upgrades.deployProxy(
        await ethers.getContractFactory('NFTUnboxing'),
        [nftBox, requestConfirmations, subscriptionId, vrfCoordinator, keyHash, acl],
        {
          kind: 'uups',
          initializer: 'initialize',
        },
      );

      return nftClaim.address;
    },
  );

export {};
