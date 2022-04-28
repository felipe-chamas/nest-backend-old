import { Signer } from 'ethers';
import { ACL } from '../../../typechain';
import { deployACL } from '../../shared/deployers';
import { shouldBehaveLikeACL } from './acl.behavior';

async function aclFixture(signers: Signer[]): Promise<{ acl: ACL }> {
  const [admin, operator] = signers;

  const [adminAddress, operatorAddress] = await Promise.all([admin.getAddress(), operator.getAddress()]);

  return {
    acl: await deployACL(admin, { admin: adminAddress, operator: operatorAddress, silent: true }),
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
