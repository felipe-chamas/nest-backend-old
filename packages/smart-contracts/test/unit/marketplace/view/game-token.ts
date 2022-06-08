import { expect } from 'chai';

export function shouldBehaveLikeMarketplaceGameTokenGetter() {
  it('returns Game Token address', async function () {
    await expect(this.contracts.marketplace.getGameToken()).eventually.eq(this.contracts.gameToken.address);
  });
}
