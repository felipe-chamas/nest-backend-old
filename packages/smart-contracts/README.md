# Falco Smart Contracts

## Build, Test

```
yarn
yarn test
```

## ERC20 Game Token

TODO: ...

## ERC20 Token Sale

TODO: ...

## NFT Contract

TODO: ...

## NFT Sale

TODO: ...

## ERC20 Game Token Staking

TODO: ...

## Marketplace

The Marketplace contract design is heavily inspired by [Rarible](https://github.com/rarible/protocol-contracts) protocol contracts.

### Features

- Offchain order signing
- Offchain orderbook
- Onchain order matching
- Exchange orders
- Barter orders
- Batched orders (multiple NFTs or a combination of NFT + ERC20 in single order)
- Order cancellation
- Use of [ERC2612](https://eips.ethereum.org/EIPS/eip-2612) ERC-712 Signed permit for ERC20 Tokens
- Use of [ERC4494](https://eips.ethereum.org/EIPS/eip-4494) ERC-712 Signed permit for ERC721 NFTs
- Contracts upgradeability

### Trading Process

Users should do these steps to successfully trade on Marketplace:

1. Use ERC2612 signature permit for ERC20 Game Token and ERC4494 signature permit for NFTs. Alternative is to Approve transfers for their assets to Marketplace contract (e.g.: call approveForAll for ERC-721, approve for ERC-20) — amount of money needed for trade is price + fee on top of that.
2. Sign trading order via preferred wallet (order is like a statement "I would like to sell my precious crypto kitty for 50 Game Tokens").
3. Save this order and signature to the database
4. If the user wants to cancel the order, he must call `cancel` function of the Marketplace smart contract.

### Marketplace Architecture

Marketplace smart contracts are built using [OpenZeppelin upgradeable smart contracts library](https://docs.openzeppelin.com/contracts/4.x/upgradeable). So the smart contract code can be updated to support new features, fix bugs etc.

Smart contracts are heavily tested, tests are provided in the test folder.

Functionality is divided into parts (each responsible for the part of algorithm).

#### Algorithms

Main functions in the Marketplace are `matchOrders`, `matchOrdersWithPermits` and `matchOrdersWithPermitsAndSenderPermit`.

- `matchOrder` takes two orders (left and right), tries to match them and then executes them if there is a match.
- `matchOrdersWithPermits` works the same as `matchOrder` additionally allows to specify ERC2612 and ERC4494 permits for ERC20 and ERC721 NFTs
- `matchOrdersWithPermitsAndSenderPermit` works the same as `matchOrdersWithPermits` additionally allows transaction sender to specify ERC2612 permit to pay for fees

Logically, whole process can be divided into stages:

- order validation (check order parameters are valid and caller is authorized to execute the order)
- asset matching (check if assets from left and right order match, extract matching assets)
- order execution (execute transfers, save hashes of the orders if needed)

##### Domain model

**AssetId**

- `bytes4 class` - first four bytes of the keccak256 hash of asset type. Used as a hint to decode the `data`.
- `bytes data` - arbitrary data related to asset. As a convention first 20 bytes are used to specify an `address` of an asset.

**Asset**

- `AssetId id` - asset id
- `uint256 value` - the amount of asset (usually amount of tokens when ERC20 or ERC1155 are used)

**Order**:

- `address maker` - (can be zero address in case when maker executes the order)
- `Asset[] makeAssets` - list of assets to exchange for
- `address taker` - (can be zero address)
- `Asset[] takeAssets` - list of assets to exchange to
- `uint256 salt` - random number to distinguish different maker's Orders (if salt = 0, then transaction should be executed by order.maker. The hash of the order is not saved)
- `uint256 start` - Order can't be matched before this date (optional)
- `uint256 end` - Order can't be matched after this date (optional)

##### Order validation

- check start/end date of the orders
- check if taker of the order is blank or taker = order.taker
- check if order is signed by its maker
  - or maker of the order is executing the transaction
- if maker of the order is a contract, then ERC-1271 check is performed

##### Asset matching

Purpose of this is to validate that **make assets** of the **left** order matches **take assets** from the **right** order and vice versa.

##### Fees

TransferManager takes protocol fees from order executor (address which executes the transaction)

##### Cancelling the order

`cancel` function can be used to cancel order. Such orders won't be matched and error will be thrown. This function is used by order maker to mark orders as cancelled. This function can be invoked only by order maker.

##### Contract events

Marketplace contract emits these events:

- Match (when orders are matched)
- Cancel (when user cancels the order)
