import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ACL } from '../../../typechain';
import { AddressZero } from '../../shared/constants';
import { deployNFTLaunchpad } from '../../shared/deployers';

export function shouldBehaveLikeConstructor() {
  let admin: SignerWithAddress;
  let launchpad: SignerWithAddress;
  let acl: ACL;

  beforeEach(function () {
    ({ admin, launchpad } = this.signers);
    ({ acl } = this.contracts);
  });

  it('should deploy NFT Launchpad', async () => {
    await expect(
      deployNFTLaunchpad(admin, {
        acl: acl.address,
        launchpad: launchpad.address,
      }),
    ).eventually.exist;
  });

  it('should fail to deploy with invalid launchpad address', async () => {
    await expect(
      deployNFTLaunchpad(admin, {
        acl: acl.address,
        launchpad: AddressZero,
      }),
    ).to.be.rejectedWith('LaunchpadIsZeroAddress()');
  });

  it('should fail to deploy with zero ACL address', async () => {
    await expect(
      deployNFTLaunchpad(admin, {
        acl: AddressZero,
        launchpad: launchpad.address,
      }),
    ).to.be.rejectedWith('ACLContractIsZeroAddress()');
  });

  it('should fail to deploy with invalid ACL address', async () => {
    await expect(
      deployNFTLaunchpad(admin, {
        acl: admin.address,
        launchpad: launchpad.address,
      }),
    ).to.be.rejectedWith('ACLAddressIsNotContract()');
  });
}
