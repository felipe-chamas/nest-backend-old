import assertArrays from 'chai-arrays';
import assertPromises from 'chai-as-promised';
import * as hre from 'hardhat';
import { use } from 'chai';
import { Address } from '../';
import { ContractTransaction } from 'ethers';
export { expect } from 'chai';
import { solidity } from 'ethereum-waffle';

use(assertArrays);
use(assertPromises);
use(solidity);

export const ONE_TOKEN = 10n**18n;

export async function awaitTx(
  txPromised: Promise<ContractTransaction>,
) {
  const tx = await txPromised;
  const txReceipt = await tx.wait();
  return txReceipt;
}

export async function runDeployTask(
  contractName: string,
  args: {[key: string]: unknown},
): Promise<Address> {
  const runSuper = async () => {return;};
  runSuper.isDefined = false;
  const result = await hre.run(
    'deploy:'+contractName,
    { ...args, silent: true },
  );
  return result;
}

export async function wait(
  unresolvedTransaction: Promise<ContractTransaction>,
) {
  const transaction = await unresolvedTransaction;
  return transaction.wait();
}


