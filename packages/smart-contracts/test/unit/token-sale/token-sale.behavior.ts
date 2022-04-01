import { shouldBehaveLikeConstructor } from './deployment/constructor';
import { shouldBehaveLikeAllowlist } from './effects/allowlist';
import { shouldBehaveLikeBuy } from './effects/buy';
import { shouldBehaveLikeClaim } from './effects/claim';
import { shouldBehaveLikeCustody } from './effects/custody';
import { shouldBehaveLikeRound } from './effects/round';
import { shouldBehaveLikeCurrentRoundIndex } from './effects/roundIndex';
import { shouldBehaveLikeVesting } from './effects/vesting';
import { shouldBehaveLikeWithdraw } from './effects/withdraw';

export function shouldBehaveLikeTokenSale() {
  describe('constructor', function () {
    shouldBehaveLikeConstructor();
  });

  describe('round', function () {
    shouldBehaveLikeRound();
  });

  describe('allowlist', function () {
    shouldBehaveLikeAllowlist();
  });

  describe('vesting', function () {
    shouldBehaveLikeVesting();
  });

  describe('custody', function () {
    shouldBehaveLikeCustody();
  });

  describe('current round index', function () {
    shouldBehaveLikeCurrentRoundIndex();
  });

  describe('buy', function () {
    shouldBehaveLikeBuy();
  });

  describe('claim', function () {
    shouldBehaveLikeClaim();
  });

  describe('withdraw', function () {
    shouldBehaveLikeWithdraw();
  });
}
