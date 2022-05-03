import { Signer } from 'ethers';
import { ERC20Mock, Splitter } from '../../../typechain';
import { deployMockERC20, deploySplitter } from '../../shared/deployers';
import { shouldBehaveLikeSplitter } from './splitter.behavior';

async function splitterFixture(signers: Signer[]): Promise<{ splitter: Splitter; mockToken: ERC20Mock }> {
  const [admin] = signers;

  return {
    mockToken: await deployMockERC20(admin, {}),
    splitter: await deploySplitter(admin),
  };
}

export function unitTestSplitter(): void {
  describe('Splitter', function () {
    beforeEach(async function () {
      const { splitter, mockToken } = await this.loadFixture(splitterFixture);

      this.contracts.mockToken = mockToken;
      this.contracts.splitter = splitter;
    });

    shouldBehaveLikeSplitter();
  });
}
