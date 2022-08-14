import { Signer, Wallet } from 'ethers';
import hre, { ethers } from 'hardhat';
import { Contracts, GodMode, Mocks } from './types';

export function baseContext(description: string, testSuite: () => void): void {
  describe(description, function () {
    before(async function () {
      const signers = await ethers.getSigners();
      const [admin, operator, launchpad, other, stranger, custody, user] = signers;
      this.signers = {
        admin,
        operator,
        other,
        stranger,
        custody,
        user,
        launchpad,
      };
      this.chainId = await admin.getChainId();
      this.contracts = {} as Contracts;
      this.mocks = {} as Mocks;
      this.godMode = {} as GodMode;
      this.loadFixture = hre.waffle.createFixtureLoader(signers as Signer[] as Wallet[]);
    });

    testSuite();
  });
}
