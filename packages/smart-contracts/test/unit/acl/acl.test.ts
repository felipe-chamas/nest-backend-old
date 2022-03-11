import { Signer } from 'ethers';
import { ACL } from '../../../typechain';
import { deployACL } from '../../shared/deployers';
import { shouldBehaveLikeACL } from './acl.behavior';

async function aclFixture(signers: Signer[]): Promise<{ acl: ACL }> {
  const [deployer, operator] = signers;

  const [deployerAddress, operatorAddress] = await Promise.all([deployer.getAddress(), operator.getAddress()]);

  return {
    acl: await deployACL(deployer, deployerAddress, operatorAddress),
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
