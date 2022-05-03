import { task, types } from 'hardhat/config';
import csv from 'csvtojson';

export const TASK_GENERATE_SPLITTER_ARGUMENTS = 'generate:splitter-arguments';

task(TASK_GENERATE_SPLITTER_ARGUMENTS, 'Generate Splitter arguments')
  .addParam('token', 'ERC20 Token to split', undefined, types.string)
  .addParam('file', 'CSV File (account, amount w/o decimals)', undefined, types.string)
  .setAction(async ({ token, file }, { ethers }) => {
    const list = await csv().fromFile(file);
    const payees = list.map(row => ({
      account: row.account,
      amount: ethers.utils.parseEther(row.amount).toString(),
    }));
    console.log(token);
    console.log(JSON.stringify(payees));
  });

export {};
