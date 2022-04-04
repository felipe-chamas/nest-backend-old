import { Signer } from 'ethers';
import { ERC20TokenRecoverable__factory } from '../../../typechain';
import { deployACL, deployMockERC20, deployNFTBox } from '../../shared/deployers';
import { shouldBehaveLikeERC20TokenRecoverable } from '../recoverable/recoverable.behavior';
import { NFT_BOX_BASE_URI, shouldBehaveLikeNFTBox } from './nftBox.behavior';

async function nftBoxFixture(signers: Signer[]) {
  const [deployer, operator] = signers;
  const [deployerAddress, operatorAddress] = await Promise.all([deployer.getAddress(), operator.getAddress()]);

  const acl = await deployACL(deployer, { admin: deployerAddress, operator: operatorAddress });

  return {
    acl,
    nftBox: await deployNFTBox(deployer, { acl: acl.address, baseUri: NFT_BOX_BASE_URI }),

    mockToken: await deployMockERC20(deployer, {}),
  };
}

export function unitTestNFTBox(): void {
  describe('NFT Box', function () {
    beforeEach(async function () {
      const { acl, nftBox, mockToken } = await this.loadFixture(nftBoxFixture);

      this.contracts.acl = acl;
      this.contracts.nftBox = nftBox;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(nftBox.address, this.signers.admin);
      this.contracts.mockToken = mockToken;
    });

    shouldBehaveLikeNFTBox();
    shouldBehaveLikeERC20TokenRecoverable();
  });
}
