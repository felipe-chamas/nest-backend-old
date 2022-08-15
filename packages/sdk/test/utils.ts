import assertArrays from 'chai-arrays';
import assertPromises from 'chai-as-promised';

import * as hre from 'hardhat';
import { use } from 'chai';
import { Address, Roles, SDK, SignerUtils } from '../';
import { BigNumber, ContractTransaction } from 'ethers';
import { expect } from 'chai';
export { expect } from 'chai';
import * as typechain from '../src/typechain';
import { solidity } from 'ethereum-waffle';
import { AccountId } from 'caip';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

use(assertArrays);
use(assertPromises);
use(solidity);

export const ONE_TOKEN = BigNumber.from(10).pow(18);

export const runDeployTask = (
  contractName: string,
  args: { [key: string]: unknown },
): Promise<Address> =>
  hre.run('deploy:' + contractName, { ...args, silent: true });

export async function wait(
  unresolvedTransaction: Promise<ContractTransaction>,
) {
  const transaction = await unresolvedTransaction;
  return transaction.wait();
}

interface NftConfig {
  name: string;
  symbol: string;
}

interface GameTokenConfig {
  name: string;
  symbol: string;
  supply: string;
}

let [acl, gameToken, box, nftUnbox, nftClaim, nft]: AccountId[] = [];

export type Actor = Awaited<ReturnType<typeof prepareActor>>;
async function prepareActor(signer: SignerWithAddress) {
  const sdk = new SDK(signer);
  const signerUtils = new SignerUtils(signer);
  const accountId = await signerUtils.createAccountIdFromAddress(
    signer.address,
  );
  const utils = await sdk.utils();
  return {
    sdk,

    // signer related info
    signer,
    accountId,
    signerUtils,

    // services
    utils,
    nft: await sdk.nft(nft),
    accessControl: await sdk.accessControl(acl),
    nftClaim: await sdk.nftClaim(nftClaim),
    boxNft: await sdk.nft(box),
    nftUnbox: await sdk.nftUnbox(nftUnbox),
    gameToken: await sdk.gameToken(gameToken),
  };
}

function _sizeOfOne<T>(input: T[]): T;
function _sizeOfOne<T>(input: Promise<T[]>): Promise<T>;
function _sizeOfOne<T>(input: T[] | Promise<T[]>) {
  if (input instanceof Promise) return input.then((x) => _sizeOfOne(x));
  expect(input).to.have.lengthOf(1);
  return input[0];
}

export const sizeOfOne = _sizeOfOne;

export type TestContext = Awaited<ReturnType<typeof prepareTestContext>>;
export async function prepareTestContext() {
  const [admin, operator, anon, anon2, minter, anon3, anon4] =
    await hre.ethers.getSigners();
  const signerUtils = new SignerUtils(admin);
  const aclAddress = await runDeployTask('acl', {
    admin: admin.address,
    operator: operator.address,
  });
  acl = await signerUtils.createAccountIdFromAddress(aclAddress);
  const gameTokenConfig: GameTokenConfig = {
    name: 'Game Token',
    symbol: 'gt',
    supply: ONE_TOKEN.mul(100).toString(),
  };
  const gameTokenAddress = await runDeployTask('game-token', {
    admin: admin.address,
    ...gameTokenConfig,
    acl: aclAddress,
  });
  gameToken = await signerUtils.createAccountIdFromAddress(gameTokenAddress);
  const boxConfig: NftConfig = {
    name: 'Box',
    symbol: 'box',
  };
  const boxAddress = await runDeployTask('nft', {
    acl: aclAddress,
    burnEnabled: true,
    ...boxConfig,
  });
  box = await signerUtils.createAccountIdFromAddress(boxAddress);
  const nftConfig: NftConfig = {
    name: 'NFT',
    symbol: 'nft',
  };
  const nftAddress = await runDeployTask('nft', {
    acl: aclAddress,
    burnEnabled: true,
    ...nftConfig,
  });
  nft = await signerUtils.createAccountIdFromAddress(nftAddress);
  const sdk = new SDK(admin);
  const accessControl = await sdk.accessControl(
    await signerUtils.createAccountIdFromAddress(aclAddress),
  );
  await accessControl.grantRole(
    await signerUtils.createAccountIdFromAddress(minter.address),
    Roles.Minter,
  );
  const nftUnboxAddress = await runDeployTask('nft-box-unboxing', {
    acl: aclAddress,
    nftBox: boxAddress,
    addToACL: true,
  });
  nftUnbox = await signerUtils.createAccountIdFromAddress(nftUnboxAddress);
  const nftClaimAddress = await runDeployTask('nft-claim', {
    acl: aclAddress,
    nft: nftAddress,
  });
  nftClaim = await signerUtils.createAccountIdFromAddress(nftClaimAddress);
  await accessControl.grantRole(nftClaim, Roles.Minter);
  const actors = {
    anon: await prepareActor(anon),
    anon2: await prepareActor(anon2),
    anon3: await prepareActor(anon3),
    anon4: await prepareActor(anon4),
    admin: await prepareActor(admin),
    minter: await prepareActor(minter),
    operator: await prepareActor(operator),
  };
  return {
    // contract configs
    gameTokenConfig,
    boxConfig,
    nftConfig,
    // actors
    ...actors,
    // addresses
    nftUnbox,
    gameToken,
    nft,
    nftClaim,
    acl,
    box,
    // accounts by role
    minters: [actors.minter.accountId, nftUnbox, nftClaim],
  };
}
