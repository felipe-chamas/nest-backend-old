import hre, { ethers } from 'hardhat';

export function baseContext(description: string, testSuite: () => void): void {
  describe(description, function () {
    before(async function () {
      this.signers = await ethers.getSigners();
      this.roles = <Record<string, string>>{
        ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
        MANAGER_ROLE: ethers.utils.keccak256('MANAGER_ROLE'),
      };

      this.loadFixture = hre.waffle.createFixtureLoader();
    });

    testSuite();
  });
}
