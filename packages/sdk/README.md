# blockhain-sdk

### Summary

This repository contains a set of tools to interract with [smart contracts](https://github.com/falco-gg/blockchain/tree/main/packages/smart-contracts)

### View Documentation

Documentation is compiled as a static html site and put into the package
at path: `@falco-gg/blockchain-sdk/docs`.

You may view it by running any static html serve tool.

Ex: [serve](https://www.npmjs.com/package/serve).

Install the `serve` package if you do not have already:

```
nmp i -g serve
```

Serve docs with it:
```
serve node_modules/@falco-gg/blockchain-sdk/docs
```

Then open your [browser](http://localhost:3000) to view documenation.


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

After {@link Signer} is created, pass it to {@link SDK}:
```
import { SDK } from '@falco-gg/blockchain-sdk';
...
const sdk = new SDK(signer);
```
> If signer is provided via the wallet which allow to switch accounts, no new instance of sdk should be created on address-switch because signer keeps track of the last account that was switched to.

> If network is switch(ex from mainnet to testnet) and provider supports switching, no new instance of sdk should be created because signer keeps track of a new account even while switching to a new network. 

### Address representation

To describe addresses on chain(accounts or smart-contracts) [caip standard](https://www.npmjs.com/package/caip) is used.
It allowes program to check if provided address is located on the same network and the rest of the system.

Ex. if you want to transfer tokens to someone, you specify receiving address
in caip format:
```
  const receiver = new caip.AccountId({
    chainId: {
      namespace: 'eip155', // 'eip155' means that its is EVM compitable chain
      reference: '1'       // '1' stands for Ethereum mainnet
    },
    address: '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb'
  });
  //// shorthand
  // const receiver = caip.AccountId.parse('eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb');

  transfer(receiver, 12345); // by providing `AccountId` and not plain `Address`(string), the program can validate your intentions.
  
```

### Services

Having sdk created, there are several services each related to set of contracts:
- {@link AccessControl} - Manages roles in the system.
- {@link Utils} - Helper methods not related to any secific contract. {@link Utils.fetchEvents | fetching events emitter by the transaction}.
- {@link GameToken} - Manages GameToken(in game fungable currency).
- {@link NFT} - Manages Generic(in game non fungable tokens).
- {@link NFTClaim} - Creates claims for nfts. Claiming nfts.
- {@link NFTUnbox} - Unboxing nfts(from another nft called sealed box that drops random nfts used in the game).

Other useful exports:
- {@link SignerUtils} - helps to manage `caip.AccountId` transformation, validation.


To create a service, call corresponding factory method on sdk instance:
For examle lets {@link NFT.listOwnTokens | list own nfts}.
```
const helmetNFTAccountId = AccountId.parse("eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb");
const helmetNFT = await sdk.nft(aclAddress); // nft that manages
const ownNftsFirstPage = await helmetNFT.listOwnTokens(
  { limit: 10, offset: 0 } // optional. This is how {@link PaginationParams | pagination} is done.
)
```
> If account is changed through the wallet, you do not need to recreate a service, because {@link Signer} always stores the most recent activated account.

> If network is switched, you have to recreate used services, because smart-contracts are located on different addresses in different network.

`AccesControl` service is managiring roles and access on the system.


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

