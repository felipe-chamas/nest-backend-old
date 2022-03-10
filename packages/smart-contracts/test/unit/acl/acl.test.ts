import { ethers } from 'hardhat';
import { ACL } from '../../../typechain';
import { deployACL } from '../../shared/deployers';
import { shouldBehaveLikeACL } from './acl.behavior';

async function aclFixture(): Promise<{ acl: ACL }> {
  const [deployer] = await ethers.getSigners();

  return {
    acl: await deployACL(deployer, deployer.address, deployer.address),
  };
}

export function unitTestACL(): void {
  describe('ACL', function () {
    beforeEach(async function () {
      const { acl } = await this.loadFixture(aclFixture);

      this.contracts.acl = acl;
    });

    shouldBehaveLikeACL();
  });
}
