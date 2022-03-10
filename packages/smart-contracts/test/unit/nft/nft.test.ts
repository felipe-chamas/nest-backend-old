import { ethers } from 'hardhat';
import { ACL, ERC20Mock, ERC20TokenRecoverable__factory, NFT } from '../../../typechain';
import { deployACL, deployMockERC20, deployNFT } from '../../shared/deployers';
import { shouldBehaveLikeERC20TokenRecoverable } from '../recoverable/recoverable.behavior';
import { shouldBehaveLikeBasicNFT } from './nft.behavior';

async function nftFixture(): Promise<{ acl: ACL; nft: NFT; mockToken: ERC20Mock }> {
  const [deployer] = await ethers.getSigners();

  const acl = await deployACL(deployer, deployer.address, deployer.address);

  return {
    acl,
    nft: await deployNFT(deployer, acl.address),
    mockToken: await deployMockERC20(deployer),
  };
}

export function unitTestNFT(): void {
  describe('NFT', function () {
    beforeEach(async function () {
      const { acl, nft, mockToken } = await this.loadFixture(nftFixture);

      this.contracts.acl = acl;
      this.contracts.nft = nft;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(nft.address, this.signers.admin);
      this.contracts.mockToken = mockToken;
    });

    shouldBehaveLikeBasicNFT();
    shouldBehaveLikeERC20TokenRecoverable();
  });
}
