# Deployment Workflow

## [Etherscan Transactions](https://testnet.bscscan.com/address/0x39bb6a99cae924e67c10209746b096cec7b23a89)

## **Verify**

```ps1
npx hardhat verify \
  --network binanceTestnet \
  0x001795d3526F05b8A1AcCE16bEd07d7B0139b698
```

## **ACL**

```ps1
npx hardhat deploy:acl \
  --network binanceTestnet \
  --admin 0x39bb6a99cae924e67c10209746b096Cec7B23a89

> 'ACL deployed to: 0x001795d3526F05b8A1AcCE16bEd07d7B0139b698'
```

- **Address**
  - [Proxy](https://testnet.bscscan.com/address/0x001795d3526F05b8A1AcCE16bEd07d7B0139b698)
  - [Contract](https://testnet.bscscan.com/address/0x53540bD8759C6Bd992AdADDEd36BC999f7637b55)

### **Grant Roles**

#### **Admin**

```ps1
npx hardhat tx:acl-grant-role \
  --network binanceTestnet \
  --acl 0x001795d3526F05b8A1AcCE16bEd07d7B0139b698 \
  --role 0x0000000000000000000000000000000000000000000000000000000000000000 \
  --to 0x39bb6a99cae924e67c10209746b096cec7b23a89

> 'Grant Role Transaction: 0xbe019ece790768743d2c4d00b865c9a3043ee056cd446d67b0e38e512938cbad'
```

#### **Operator**

```ps1
npx hardhat tx:acl-grant-role \
  --network binanceTestnet \
  --acl 0x001795d3526F05b8A1AcCE16bEd07d7B0139b698 \
  --role 0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929 \
  --to 0x39bb6a99cae924e67c10209746b096cec7b23a89

> 'Grant Role Transaction: 0xd528fe75c0f828f6c68182cd0d17fd400cb909b0af5855060069c5d9674d9ac1'
```

#### **Owner**

```ps1
npx hardhat tx:acl-grant-role \
  --network binanceTestnet \
  --acl 0x001795d3526F05b8A1AcCE16bEd07d7B0139b698 \
  --role 0xb19546dff01e856fb3f010c267a7b1c60363cf8a4664e21cc89c26224620214e \
  --to 0x39bb6a99cae924e67c10209746b096cec7b23a89

> 'Grant Role Transaction: 0xc19097ce81a24703b27f2e8438bd87ef5630714b90c1881564db30c68fc11b67'
```

#### **Minter**

```ps1
npx hardhat tx:acl-grant-role \
  --network binanceTestnet \
  --acl 0x001795d3526F05b8A1AcCE16bEd07d7B0139b698 \
  --role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6 \
  --to 0x39bb6a99cae924e67c10209746b096cec7b23a89

> 'Grant Role Transaction: 0xb37730865948b4791a50861dc06843f225deea254ed2d86cf7164da9ac46f403'

npx hardhat tx:acl-grant-role \
  --network binanceTestnet \
  --acl 0x001795d3526F05b8A1AcCE16bEd07d7B0139b698 \
  --role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6 \
  --to 0x4c50bd152ad12795fb7142c24685ca79ab2ff05b

> 'Grant Role Transaction: 0xa6c3b7919a5094e2a289ac7adfae207d21edeafbba4988d1df12e5605b2ac17e'
```

## Game Token

```ps1
npx hardhat deploy:game-token \
  --network binanceTestnet \
  --admin 0x39bb6a99cae924e67c10209746b096Cec7B23a89 \
  --acl 0x001795d3526F05b8A1AcCE16bEd07d7B0139b698 \
  --name harvest-game-token \
  --symbol HTK \
  --supply 100000000000000000000

> 'Game Token deployed to: 0x11C955239e2a17De031f9716B4a08ACb9d29A3fA'
```

- **Address**
  - [Proxy](https://testnet.bscscan.com/address/0x11C955239e2a17De031f9716B4a08ACb9d29A3fA)
  - [Contract](https://testnet.bscscan.com/address/0x97dDfDcAA06C7aC427198012f618F8808C49031b)

## NFT

```ps1
npx hardhat deploy:nft \
  --network binanceTestnet \
  --name harvest-game-nft \
  --symbol HGNFT \
  --acl 0x001795d3526F05b8A1AcCE16bEd07d7B0139b698

> 'NFT deployed to: 0x83269FeB3c2e078CD364b69B3a76c51074e45cFa'
```

- **Address**
  - [Proxy](https://testnet.bscscan.com/address/0x83269FeB3c2e078CD364b69B3a76c51074e45cFa)
  - [Contract](https://testnet.bscscan.com/address/0xcAC00A9cECafef68103dda0F4e7fc35D77F2697b)
