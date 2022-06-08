import { Signer } from 'ethers';
import {
  AccessControllable__factory,
  ERC20TokenRecoverable__factory,
  INFTPermitMock__factory,
} from '../../../typechain';
import { MAX_UINT256 } from '../../shared/constants';
import { deployACL, deployMockERC20, deployNFT, deployNFTMock } from '../../shared/deployers';
import { Roles } from '../../shared/types';
import { shouldBehaveLikeAccessControllable } from '../access-controllable/access-controllable.behavior';
import { shouldBehaveLikeNFTPermit } from '../nft-permit/permit.behavior';
import { shouldBehaveLikeERC20TokenRecoverable } from '../recoverable/recoverable.behavior';
import { shouldBehaveLikeNFT, shouldBehaveLikeNFTWithLimitedSupply } from './nft.behavior';

async function nftFixture(signers: Signer[], maxLimitedSupply = MAX_UINT256, burnEnabled = false) {
  const [deployer, operator] = signers;
  const [deployerAddress, operatorAddress] = await Promise.all([deployer.getAddress(), operator.getAddress()]);

  const acl = await deployACL(deployer, { admin: deployerAddress, operator: operatorAddress, silent: true });

  await acl.grantRole(Roles.MINTER_ROLE, operatorAddress);

  const nftMock = await deployNFTMock(deployer, { acl: acl.address, maxTokenSupply: maxLimitedSupply.toString(10) });

  return {
    acl,
    nft: await deployNFT(deployer, {
      acl: acl.address,
      maxTokenSupply: maxLimitedSupply.toString(10),
      burnEnabled,
      silent: true,
    }),
    mockToken: await deployMockERC20(deployer, {}),
    nftMock,
  };
}

export function unitTestNFT(): void {
  describe('NFT', function () {
    const unlimitedSupplyFixture = (signers: Signer[]) => nftFixture(signers);
    beforeEach(async function () {
      const { acl, nft, mockToken, nftMock } = await this.loadFixture(unlimitedSupplyFixture);

      this.contracts.acl = acl;
      this.contracts.nft = nft;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(nft.address, this.signers.admin);
      this.contracts.accessControllable = AccessControllable__factory.connect(nft.address, this.signers.admin);
      this.contracts.mockToken = mockToken;
      this.contracts.nftPermit = INFTPermitMock__factory.connect(nftMock.address, this.signers.admin);
    });

    shouldBehaveLikeNFT(false);
    context('ERC4494 (permit)', function () {
      shouldBehaveLikeNFTPermit();
    });
    shouldBehaveLikeERC20TokenRecoverable();
    shouldBehaveLikeAccessControllable();
  });

  describe('NFT Limited Supply', function () {
    const MAX_TOKEN_SUPPLY = 3n;
    const limitedSupplyFixture = (signers: Signer[]) => nftFixture(signers, MAX_TOKEN_SUPPLY);
    beforeEach(async function () {
      const { acl, nft, mockToken, nftMock } = await this.loadFixture(limitedSupplyFixture);

      this.contracts.acl = acl;
      this.contracts.nft = nft;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(nft.address, this.signers.admin);
      this.contracts.accessControllable = AccessControllable__factory.connect(nft.address, this.signers.admin);
      this.contracts.mockToken = mockToken;
      this.contracts.nftPermit = INFTPermitMock__factory.connect(nftMock.address, this.signers.admin);
    });

    shouldBehaveLikeNFT(false);
    shouldBehaveLikeNFTWithLimitedSupply(MAX_TOKEN_SUPPLY);
    context('ERC4494 (permit)', function () {
      shouldBehaveLikeNFTPermit();
    });
    shouldBehaveLikeERC20TokenRecoverable();
    shouldBehaveLikeAccessControllable();
  });

  describe('NFT Burn enabled', function () {
    const burnEnabledFixture = (signers: Signer[]) => nftFixture(signers, undefined, true);
    beforeEach(async function () {
      const { acl, nft, mockToken } = await this.loadFixture(burnEnabledFixture);

      this.contracts.acl = acl;
      this.contracts.nft = nft;
      this.contracts.recoverable = ERC20TokenRecoverable__factory.connect(nft.address, this.signers.admin);
      this.contracts.accessControllable = AccessControllable__factory.connect(nft.address, this.signers.admin);
      this.contracts.mockToken = mockToken;
    });

    shouldBehaveLikeNFT(true);
    shouldBehaveLikeERC20TokenRecoverable();
    shouldBehaveLikeAccessControllable();
  });
}
