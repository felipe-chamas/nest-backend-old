import assertArrays from 'chai-arrays';
import assertPromises from 'chai-as-promised';
import * as hre from 'hardhat';
import { use } from 'chai';
import { Address } from '../';
export { expect } from 'chai';

use(assertArrays);
use(assertPromises);

export async function runDeployTask(
  contractName: string,
  args: {[key: string]: unknown},
): Promise<Address> {
  const runSuper = async () => {return;};
  runSuper.isDefined = false;
  const result = await hre.tasks['deploy:'+contractName].action(
    { ...args, silent: true },
    hre,
    runSuper,
  );
  return result;
}


