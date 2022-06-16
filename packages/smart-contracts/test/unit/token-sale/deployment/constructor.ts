import { MockContract } from '@defi-wonderland/smock';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ACL, ERC20Mock, GameToken } from '../../../../typechain';
import { AddressZero } from '../../../shared/constants';
import { deployTokenSale } from '../../../shared/deployers';

export function shouldBehaveLikeConstructor() {
  let admin: SignerWithAddress;
  let custody: SignerWithAddress;
  let acl: ACL;
  let gameToken: GameToken;
  let erc20: MockContract<ERC20Mock>;

  beforeEach(function () {
    ({ admin, custody } = this.signers);
    ({ acl, gameToken } = this.contracts);
    ({ erc20 } = this.mocks);
  });

  it('should deploy Token Sale', async () => {
    await expect(
      deployTokenSale(admin, {
        acl: acl.address,
        vestingPeriod: 100,
        custody: custody.address,
        gameToken: gameToken.address,
        paymentToken: erc20.address,
      }),
    ).eventually.exist;
  });

  it('should fail to deploy with invalid vesting period', async () => {
    await expect(
      deployTokenSale(admin, {
        acl: acl.address,
        vestingPeriod: 0,
        custody: custody.address,
        gameToken: gameToken.address,
        paymentToken: erc20.address,
      }),
    ).to.be.rejectedWith('InvalidVestingPeriod()');
  });

  it('should fail to deploy with invalid custody address', async () => {
    await expect(
      deployTokenSale(admin, {
        acl: acl.address,
        vestingPeriod: 100,
        custody: AddressZero,
        gameToken: gameToken.address,
        paymentToken: erc20.address,
      }),
    ).to.be.rejectedWith('InvalidCustodyAddress()');
  });

  it('should fail to deploy with invalid game token address', async () => {
    await expect(
      deployTokenSale(admin, {
        acl: acl.address,
        vestingPeriod: 100,
        custody: custody.address,
        gameToken: AddressZero,
        paymentToken: erc20.address,
      }),
    ).to.be.rejectedWith('InvalidGameTokenAddress()');
  });

  it('should fail to deploy with invalid payment token address', async () => {
    await expect(
      deployTokenSale(admin, {
        acl: acl.address,
        vestingPeriod: 100,
        custody: custody.address,
        gameToken: gameToken.address,
        paymentToken: AddressZero,
      }),
    ).to.be.rejectedWith('InvalidPaymentTokenAddress()');
  });

  it('should fail to deploy with zero ACL address', async () => {
    await expect(
      deployTokenSale(admin, {
        acl: AddressZero,
        vestingPeriod: 100,
        custody: custody.address,
        gameToken: gameToken.address,
        paymentToken: erc20.address,
      }),
    ).to.be.rejectedWith('ACLContractIsZeroAddress()');
  });

  it('should fail to deploy with invalid ACL address', async () => {
    await expect(
      deployTokenSale(admin, {
        acl: admin.address,
        vestingPeriod: 100,
        custody: custody.address,
        gameToken: gameToken.address,
        paymentToken: erc20.address,
      }),
    ).to.be.rejectedWith('ACLAddressIsNotContract()');
  });
}
