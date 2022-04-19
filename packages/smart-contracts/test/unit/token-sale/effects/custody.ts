import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { beforeEach } from 'mocha';
import { TokenSale } from '../../../../typechain';
import { AddressZero } from '../../../shared/constants';
import { Roles } from '../../../shared/types';

export function shouldBehaveLikeCustody() {
  let operator: SignerWithAddress;
  let stranger: SignerWithAddress;
  let custody: SignerWithAddress;
  let other: SignerWithAddress;
  let tokenSale: TokenSale;
  beforeEach(function () {
    ({ operator, stranger, custody, other } = this.signers);
    ({ tokenSale } = this.contracts);
  });

  context('when called by operator', () => {
    it('sets custody', async () => {
      await expect(tokenSale.connect(operator).setCustody(other.address))
        .to.emit(tokenSale, 'CustodyChanged')
        .withArgs(custody.address, other.address);
      await expect(tokenSale.getCustody()).eventually.to.eq(other.address);
    });

    it('fails to set custody to zero address', async () => {
      await expect(tokenSale.connect(operator).setCustody(AddressZero)).to.be.revertedWith('InvalidCustodyAddress()');
    });
  });

  context('when called by stranger', () => {
    it('reverts', async () => {
      await expect(tokenSale.connect(stranger).setCustody(other.address)).to.be.revertedWith(
        `AccessControl: account ${stranger.address.toLowerCase()} is missing role ${Roles.OPERATOR_ROLE}`,
      );
    });
  });
}
