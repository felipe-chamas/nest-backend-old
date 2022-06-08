import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumberish } from 'ethers';
import { ERC721Upgradeable, INFTPermitMock } from '../../../typechain';
import { currentTime, getTransferEvent, signERC4494Permit } from '../../shared/utils';

const _INTERFACE_ID_ERC721 = '0x80ac58cd';
const _INTERFACE_ID_ERC721_METADATA = '0x5b5e139f';
const _INTERFACE_ID_ERC165 = '0x01ffc9a7';
const _INTERFACE_WITH_PERMIT = '0x5604e225';

export function shouldBehaveLikeNFTPermit() {
  let contract: INFTPermitMock;
  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let tokenId: BigNumberish;
  beforeEach(async function () {
    ({ nftPermit: contract } = this.contracts);
    ({ admin: deployer, user: alice, other: bob } = this.signers);

    const tx = await contract.connect(deployer).mint();
    ({ tokenId } = await getTransferEvent(tx, contract as unknown as ERC721Upgradeable));
  });

  context('Interfaces', function () {
    it('has all the right interfaces', async function () {
      const interfaces = [
        _INTERFACE_ID_ERC721,
        _INTERFACE_ID_ERC721_METADATA,
        _INTERFACE_ID_ERC165,
        _INTERFACE_WITH_PERMIT,
      ];
      for (const iface of interfaces) {
        expect(await contract.supportsInterface(iface)).to.be.true;
      }
    });
  });
  context('Permit', function () {
    it('nonce increments after each transfer', async function () {
      expect(await contract.nonces(tokenId)).to.be.equal(0);

      await contract.transferFrom(deployer.address, bob.address, tokenId);

      expect(await contract.nonces(tokenId)).to.be.equal(1);

      await contract.connect(bob).transferFrom(bob.address, deployer.address, tokenId);

      expect(await contract.nonces(tokenId)).to.be.equal(2);
    });

    it('can use permit to get approved', async function () {
      // set deadline in 7 days
      const deadline = (await currentTime()) + 7 * 24 * 60 * 60;

      // sign Permit for bob
      const signature = await signERC4494Permit(
        deployer,
        contract.address,
        bob.address,
        tokenId.toString(),
        (await contract.nonces(tokenId)).toNumber(),
        deadline,
      );

      // verify that bob is not approved before permit is used
      expect(await contract.getApproved(tokenId)).to.not.equal(bob.address);

      // use permit
      await contract.connect(bob).permit(bob.address, tokenId, deadline, signature.sig);

      // verify that now bob is approved
      expect(await contract.getApproved(tokenId)).to.be.equal(bob.address);
    });

    it('can not use a permit after a transfer (cause nonce does not match)', async function () {
      // set deadline in 7 days
      const deadline = (await currentTime()) + 7 * 24 * 60 * 60;

      // sign Permit for bob
      const signature = await signERC4494Permit(
        deployer,
        contract.address,
        bob.address,
        tokenId.toString(),
        (await contract.nonces(tokenId)).toNumber(),
        deadline,
      );

      // first transfer to alice
      await contract.transferFrom(deployer.address, await alice.getAddress(), tokenId);

      // then send back to deployer so owner is right (but nonce won't be)
      await contract.connect(alice).transferFrom(await alice.getAddress(), deployer.address, tokenId);

      // then try to use permit, should throw because nonce is not valid anymore
      await expect(contract.connect(bob).permit(bob.address, tokenId, deadline, signature.sig)).to.be.revertedWith(
        '!INVALID_PERMIT_SIGNATURE!',
      );
    });

    it('can not use a permit with right nonce but wrong owner', async function () {
      // first transfer to someone
      await contract.transferFrom(deployer.address, await alice.getAddress(), tokenId);

      // set deadline in 7 days
      const deadline = (await currentTime()) + 7 * 24 * 60 * 60;

      // sign Permit for bob
      // Permit will be signed using deployer account, so nonce is right, but owner isn't
      const signature = await signERC4494Permit(
        deployer,
        contract.address,
        bob.address,
        '1',
        1, // nonce is one here
        deadline,
      );

      // then try to use permit, should throw because owner is wrong
      await expect(contract.connect(bob).permit(bob.address, tokenId, deadline, signature.sig)).to.be.revertedWith(
        '!INVALID_PERMIT_SIGNATURE!',
      );
    });

    it('can not use a permit expired', async function () {
      // set deadline 7 days in the past
      const deadline = (await currentTime()) - 7 * 24 * 60 * 60;

      // sign Permit for bob
      // this Permit is expired as deadline is in the past
      const signature = await signERC4494Permit(
        deployer,
        contract.address,
        bob.address,
        '1',
        (await contract.nonces(tokenId)).toNumber(),
        deadline,
      );

      await expect(contract.connect(bob).permit(bob.address, tokenId, deadline, signature.sig)).to.be.revertedWith(
        '!PERMIT_DEADLINE_EXPIRED!',
      );
    });

    it('approved / approvedForAll accounts can create valid permits', async function () {
      // first send token to alice
      await contract.transferFrom(deployer.address, await alice.getAddress(), tokenId);

      // set deadline in 7 days
      const deadline = (await currentTime()) + 7 * 24 * 60 * 60;

      // get a signature from deployer for bob
      // sign Permit for bob
      const signature = await signERC4494Permit(
        deployer,
        contract.address,
        bob.address,
        tokenId.toString(),
        1,
        deadline,
      );

      // Bob tries to use signature, it should fail because deployer is not approved
      await expect(contract.connect(bob).permit(bob.address, tokenId, deadline, signature.sig)).to.be.revertedWith(
        '!INVALID_PERMIT_SIGNATURE!',
      );

      // alice approves deployer
      await contract.connect(alice).setApprovalForAll(deployer.address, true);

      // now using the permit should work because deployer is approvedForAll on Alice's tokens
      await contract.connect(bob).permit(bob.address, tokenId, deadline, signature.sig);

      // bob should now be approved on tokenId one
      expect(await contract.getApproved(tokenId)).to.be.equal(bob.address);
    });

    it('can use permit to get approved and transfer in the same tx (safeTransferWithPermit)', async function () {
      // set deadline in 7 days
      const deadline = (await currentTime()) + 7 * 24 * 60 * 60;

      // sign Permit for bob
      const signature = await signERC4494Permit(
        deployer,
        contract.address,
        bob.address,
        tokenId.toString(),
        (await contract.nonces(tokenId)).toNumber(),
        deadline,
      );

      expect(await contract.getApproved(tokenId)).to.not.equal(bob.address);

      await contract
        .connect(bob)
        .safeTransferFromWithPermit(deployer.address, bob.address, tokenId, [], deadline, signature.sig, {
          gasLimit: 1000000,
        });

      expect(await contract.ownerOf(tokenId)).to.be.equal(bob.address);
    });

    it('can not use permit to get approved and transfer in the same tx if wrong sender', async function () {
      // set deadline in 7 days
      const deadline = (await currentTime()) + 7 * 24 * 60 * 60;

      // sign Permit for bob
      const signature = await signERC4494Permit(
        deployer,
        contract.address,
        bob.address,
        '1',
        (await contract.nonces(tokenId)).toNumber(),
        deadline,
      );

      // try to use permit for bob with Alice account, fails.
      await expect(
        contract
          .connect(alice)
          .safeTransferFromWithPermit(deployer.address, bob.address, tokenId, [], deadline, signature.sig, {
            gasLimit: 1000000,
          }),
      ).to.be.revertedWith('!INVALID_PERMIT_SIGNATURE!');
    });
  });
}
