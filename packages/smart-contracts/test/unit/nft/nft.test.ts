import { Signer } from 'ethers';
import { ERC20TokenRecoverable__factory } from '../../../typechain';
import { MAX_UINT256 } from '../../shared/constants';
import { deployACL, deployMockERC20, deployNFT } from '../../shared/deployers';
import { shouldBehaveLikeERC20TokenRecoverable } from '../recoverable/recoverable.behavior';
import { shouldBehaveLikeNFT, shouldBehaveLikeNFTWithLimitedSupply } from './nft.behavior';

async function nftFixture(signers: Signer[], maxLimitedSupply = MAX_UINT256) {
  const [deployer, operator] = signers;
  const [deployerAddress, operatorAddress] = await Promise.all([deployer.getAddress(), operator.getAddress()]);

  const acl = await deployACL(deployer, deployerAddress, operatorAddress);

  return {
    acl,
    nft: await deployNFT(deployer, acl.address, undefined, undefined, undefined, maxLimitedSupply),
    mockToken: await deployMockERC20(deployer),
  };
}

export function unitTestNFT(): void {
  describe('NFT', function () {
    const unlimitedSupplyFixture = (signers: Signer[]) => nftFixture(signers);
    beforeEach(async function () {
      const { acl, nft, mockToken } = await this.loadFixture(unlimitedSupplyFixture);

      this.contracts.acl = acl;
      this.contracts.nft = nft;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(nft.address, this.signers.admin);
      this.contracts.mockToken = mockToken;
    });

    shouldBehaveLikeNFT();
    shouldBehaveLikeERC20TokenRecoverable();
  });

  describe('NFT Limited Supply', function () {
    const MAX_TOKEN_SUPPLY = 3n;
    const limitedSupplyFixture = (signers: Signer[]) => nftFixture(signers, MAX_TOKEN_SUPPLY);
    beforeEach(async function () {
      const { acl, nft, mockToken } = await this.loadFixture(limitedSupplyFixture);

      this.contracts.acl = acl;
      this.contracts.nft = nft;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(nft.address, this.signers.admin);
      this.contracts.mockToken = mockToken;
    });

    shouldBehaveLikeNFT();
    shouldBehaveLikeNFTWithLimitedSupply(MAX_TOKEN_SUPPLY);
    shouldBehaveLikeERC20TokenRecoverable();
  });
}
