import { Signer, Wallet } from 'ethers';
import hre, { ethers } from 'hardhat';
import { Contracts } from './types';

export function baseContext(description: string, testSuite: () => void): void {
  describe(description, function () {
    before(async function () {
      const signers = await ethers.getSigners();
      const [admin, operator, other, stranger] = signers;
      this.signers = {
        admin,
        operator,
        other,
        stranger,
      };
      this.roles = {
        ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
        OPERATOR_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OPERATOR_ROLE')),
      };
      this.contracts = {} as Contracts;
      this.loadFixture = hre.waffle.createFixtureLoader(signers as Signer[] as Wallet[]);
    });

    testSuite();
  });
}
