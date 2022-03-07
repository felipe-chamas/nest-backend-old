import hre, { ethers } from 'hardhat';

export function baseContext(description: string, testSuite: () => void): void {
  describe(description, function () {
    before(async function () {
      this.signers = await ethers.getSigners();

      this.loadFixture = hre.waffle.createFixtureLoader();
    });

    testSuite();
  });
}
