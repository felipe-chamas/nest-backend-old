# blockhain-sdk

### Summary

This repository contains a set of tools to interract with [smart contracts](https://github.com/falco-gg/blockchain/tree/main/packages/smart-contracts)

### Install

Install it with [npm](https://www.npmjs.com/package/@falco-gg/blockchain-sdk)

```
  npm login
  npm install --save @falco-gg/blockchain-sdk
```

### Usage

First sdk should be initialized with [signer/wallet](https://docs.ethers.io/v5/api/signer/)

In browser signer could be aquired with following command(Metamask extension should be installed):
```
import { ethers } from 'ethers';
...
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", [])
const signer = provider.getSigner();
```

In NodeJs application:
```
const signer = new ethers.Wallet(
    '0xdf57089febbacf7b____fa9fc08a93fdc68_________2411a14efcf23656e', // private key
    new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545"),     // url of rpc node
);
```

After Signer is created, create sdk instance:
```
import { createSdk } from '@falco-gg/blockchain-sdk';
...
const sdk = await createSdk(signer);
```
If you need to relogin user, you should create sdk instance again with another signer corresponding to new user.

Having sdk created, there are several services each related to group of contracts. For instance `AccessControl`.

## AccessControl

`AccesControl` service is managiring roles and access on the system.

Create instance of it with:
```
const accessControl = sdk.createAccessControl(aclAddress); // aclAddress is very important here. It's address of access control main contract on blockchain
```

For instance you can grant role:
```
it('should grand role', async () => {
  const [signer1] = await hre.ethers.getSigners();
  const transaction = await aclServiceAsAdmin
    .grantRole(signer1.address, 'Operator');
  await expect(transaction.wait()).to.eventually.be.fulfilled;
  const operators = await aclServiceAsAdmin.listByRole('Operator');
  expect(operators).to.be.ofSize(2);
});
```

Revoke role:
```
  it('should revoke role', async () => {
    const transaction = await aclServiceAsAdmin
      .revokeRole(operator.address, 'Operator');
    await expect(transaction.wait()).to.eventually.be.fulfilled;
    await expect(aclServiceAsAdmin.listByRole('Operator'))
      .to.eventually.have.lengthOf(0);
  });
```


## Utils
`fetchEvents` - method fetches events from specified transaction.
As a result it return array of objects with properties equal to
event named arguments.
```
const transaction = await gameTokenService
  .transfer(anon.address, transferAmount);
await transaction.wait();
// fetch Transfer events by transaction hash
const events = await utils.fetchEvents(
  transaction.hash,
  gameTokenAddress,
  'GameToken',
  'Transfer',
);
// check that only single transfer event was returned
expect(events).to.have.lengthOf(1);
// check event properties
const event = events[0];
expect(event.to.address).to.equal(anon.address);
expect(event.from.address).to.equal(admin.address);
expect(event.value.toNumber()).to.equal(transferAmount);
```
The type of `contractName` and `eventName` extends string and contains
every possible contract/event names. If not existing event is specified,
error returned.

If `eventName` was not specified, every event that is from specified contract
will be returned


`createAccountIdFromAddress` - helper method to create
address of [caip](https://www.npmjs.com/package/caip) format.


## GameToken
`GameToken` is a service to interact with GameToken(ERC20) contract.
It contains basic operations to get balance, transfer, get contract metadata,
manage allowance.
Additionaly it supports creating off-chain permits with `createAllowancePermit`
and then submitting permits with `submitAllowancePermit`.
Usecase of off-chain permits is as following: a person who wants to transfer
GameTokens to someone, create a permit(signs it with metamask or wallet) without
sending a transaction to blockchain(to transaction fee).
Instead permit is sent by email of any other off-chain method to the receiver.
The receiver than submits permit(pays transaction fee), thus changes allowance.


## NFT
`NFT` is a service to interact with NFT(ERC721) contract.
It contains basic operations to get balance, transfer, get contract metadata,
manage allowance.

## NFTClaim
`NFTClaim` is a service to create nft claiming (meaning to make a gift for a user)
and to create claim proofs (user who were gifted nft proofs to become nft's owner)

see [commends](https://github.com/falco-gg/blockchain/blob/main/packages/sdk/src/services/nft-claim.ts) for more info
see [tests](https://github.com/falco-gg/blockchain/blob/main/packages/sdk/test/nft-claim.test.ts) for usecases




### Development

Clone monorepo:
```
git clone https://github.com/falco-gg/blockchain
```

Go to packages/sdk and install dependencies:
```
cd blockchain/packages/sdk
yarn install
```

Nuild typechain interfaces of smart contracts:
```
yarn contracts
```

Build sdk:
```
yarn build
```

Run tests:
```
yarn test
```

Publish package to npm:
```
npm login
npm publish --access restricted
```

