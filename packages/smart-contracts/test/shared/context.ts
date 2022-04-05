import { Signer, Wallet } from 'ethers';
import hre, { ethers } from 'hardhat';
import { Contracts, GodMode, Mocks } from './types';

export function baseContext(description: string, testSuite: () => void): void {
  describe(description, function () {
    before(async function () {
      const signers = await ethers.getSigners();
      const [admin, operator, other, stranger, custody, user] = signers;
      this.signers = {
        admin,
        operator,
        other,
        stranger,
        custody,
        user,
      };
      this.roles = {
        ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
        OPERATOR_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OPERATOR_ROLE')),
        OWNER_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OWNER_ROLE')),
      };
      this.contracts = {} as Contracts;
      this.mocks = {} as Mocks;
      this.godMode = {} as GodMode;
      this.loadFixture = hre.waffle.createFixtureLoader(signers as Signer[] as Wallet[]);
    });

    testSuite();
  });
}
