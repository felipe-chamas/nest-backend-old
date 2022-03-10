import { expect } from 'chai';
import { NFT } from '../../../typechain';

export function shouldBehaveLikeBasicNFT() {
  context('Basic NFT', function () {
    let nft: NFT;

    beforeEach(function () {
      ({ nft } = this.contracts);
    });

    it('should have name', async () => {
      await expect(nft.name()).eventually.is.not.empty;
    });

    it('should have symbol', async () => {
      await expect(nft.symbol()).eventually.is.not.empty;
    });
  });
}
