# Deployment Workflow

## [Etherscan Transactions](https://goerli.etherscan.io/address/0x39bb6a99cae924e67c10209746b096cec7b23a89)

## **ACL**

```ps1
npx hardhat deploy:acl \
  --network goerli \
  --admin 0x39bb6a99cae924e67c10209746b096Cec7B23a89

> 'ACL deployed to: 0xBfD38089781bb667f25837f0383Da1a42407292b'
```

- **Transaction**
  - [Proxy](https://goerli.etherscan.io/tx/0x938cdcbaf28aa8400fbbd0d0b977d01a85afa933d693aa26c93f89405efe0a4a)
  - [Contract](https://goerli.etherscan.io/tx/0x1bb29245d4c451e3ac6912f812b5eda4b75f10dc951c4737383d0a55e508015b)
- **Address**
  - [Proxy](https://goerli.etherscan.io/address/0xbfd38089781bb667f25837f0383da1a42407292b)
  - [Contract](https://goerli.etherscan.io/address/0xcac8e2e7291048898d80375da2e954e2598395eb)

### **Grant Roles**

#### **Admin**

```ps1
npx hardhat tx:acl-grant-role \
  --network goerli \
  --acl 0xBfD38089781bb667f25837f0383Da1a42407292b \
  --role 0x0000000000000000000000000000000000000000000000000000000000000000 \
  --to 0x39bb6a99cae924e67c10209746b096cec7b23a89

> 'Grant Role Transaction: 0xbe019ece790768743d2c4d00b865c9a3043ee056cd446d67b0e38e512938cbad'
```

- [Transaction](https://goerli.etherscan.io/tx/0xbe019ece790768743d2c4d00b865c9a3043ee056cd446d67b0e38e512938cbad)

#### **Operator**

```ps1
npx hardhat tx:acl-grant-role \
  --network goerli \
  --acl 0xBfD38089781bb667f25837f0383Da1a42407292b \
  --role 0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929 \
  --to 0x39bb6a99cae924e67c10209746b096cec7b23a89

> 'Grant Role Transaction: 0xd528fe75c0f828f6c68182cd0d17fd400cb909b0af5855060069c5d9674d9ac1'
```

- [Transaction](https://goerli.etherscan.io/tx/0xd528fe75c0f828f6c68182cd0d17fd400cb909b0af5855060069c5d9674d9ac1)

#### **Owner**

```ps1
npx hardhat tx:acl-grant-role \
  --network goerli \
  --acl 0xBfD38089781bb667f25837f0383Da1a42407292b \
  --role 0xb19546dff01e856fb3f010c267a7b1c60363cf8a4664e21cc89c26224620214e \
  --to 0x39bb6a99cae924e67c10209746b096cec7b23a89

> 'Grant Role Transaction: 0xc19097ce81a24703b27f2e8438bd87ef5630714b90c1881564db30c68fc11b67'
```

- [Transaction](https://goerli.etherscan.io/tx/0xc19097ce81a24703b27f2e8438bd87ef5630714b90c1881564db30c68fc11b67)

#### **Minter**

```ps1
npx hardhat tx:acl-grant-role \
  --network goerli \
  --acl 0xBfD38089781bb667f25837f0383Da1a42407292b \
  --role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6 \
  --to 0x39bb6a99cae924e67c10209746b096cec7b23a89

> 'Grant Role Transaction: 0xb37730865948b4791a50861dc06843f225deea254ed2d86cf7164da9ac46f403'

npx hardhat tx:acl-grant-role \
  --network goerli \
  --acl 0xBfD38089781bb667f25837f0383Da1a42407292b \
  --role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6 \
  --to 0x4c50bd152ad12795fb7142c24685ca79ab2ff05b

> 'Grant Role Transaction: 0xa6c3b7919a5094e2a289ac7adfae207d21edeafbba4988d1df12e5605b2ac17e'
```

- [Transaction](https://goerli.etherscan.io/tx/0xb37730865948b4791a50861dc06843f225deea254ed2d86cf7164da9ac46f403)
- [Transaction](https://goerli.etherscan.io/tx/0xa6c3b7919a5094e2a289ac7adfae207d21edeafbba4988d1df12e5605b2ac17e)

## Game Token

```ps1
npx hardhat deploy:game-token \
  --network goerli \
  --admin 0x39bb6a99cae924e67c10209746b096Cec7B23a89 \
  --acl 0xBfD38089781bb667f25837f0383Da1a42407292b \
  --name game-token \
  --symbol GTK \
  --supply 100000000000000000000

> 'Game Token deployed to: 0xC2c31581eAA36d5E21519A66C037E4Eae6ea3CC9'
```

- **Transaction**
  - [Proxy](https://goerli.etherscan.io/tx/0x27ccca26d34ddc25b91634a06471882f815a5f3a1169aae9e883e5441e562e87)
  - [Contract](https://goerli.etherscan.io/tx/0x4e5e65cbf1ebb856715e195379da153b4657d7de64c0172551c8e7bc0a7e8d31)
- **Address**
  - [Proxy](https://goerli.etherscan.io/address/0xc2c31581eaa36d5e21519a66c037e4eae6ea3cc9)
  - [Contract](https://goerli.etherscan.io/address/0xd9d0486518190d4763036b3d612edf791387f2d9)

## NFT

```ps1
npx hardhat deploy:nft \
  --network goerli \
  --name game-nft \
  --symbol GNFT \
  --acl 0xBfD38089781bb667f25837f0383Da1a42407292b

> 'NFT deployed to: 0xAC73FF5278B24AE071080450994Fe192D109C593'
```

- **Transaction**
  - [Proxy](https://goerli.etherscan.io/tx/0x50936eb472f23aa53a1cdb754292edd23eb0424c845fb19f31b4707e0ecae360)
  - [Contract](https://goerli.etherscan.io/tx/0xd07464d4ccce139ff3e4257c4c092f2c52f252c98e2ae21953aabf1e252ceacb)
- **Address**
  - [Proxy](https://goerli.etherscan.io/address/0xac73ff5278b24ae071080450994fe192d109c593)
  - [Contract](https://goerli.etherscan.io/address/0x0a8477d3c733f41e6c2ebcdf21260a1cff8e81c1)

## NFT Claim

```ps1
npx hardhat deploy:nft-claim \
  --network goerli \
  --nft 0xAC73FF5278B24AE071080450994Fe192D109C593 \
  --acl 0xBfD38089781bb667f25837f0383Da1a42407292b

> 'NFT Claim is deployed to: 0x4c50Bd152ad12795FB7142C24685ca79aB2fF05B'
```

- **Transaction**
  - [Proxy](https://goerli.etherscan.io/tx/0x533a9b3c62a4ddf43f770551cf819fb87de03ecc10c4dec3ef18144dd95060b7)
  - [Contract](https://goerli.etherscan.io/tx/0x6246a6bbd6044a95474e1d363381e8fbd6e56a53cc2cc21eb84e7f456e4a56b0)
- **Address**
  - [Proxy](https://goerli.etherscan.io/address/0x4c50bd152ad12795fb7142c24685ca79ab2ff05b)
  - [Contract](https://goerli.etherscan.io/address/0x935440f06e0459c7d4be87801da1129cdaeb3835)

### Generate Merkel Root

```ps1
npx hardhat generate:nft-claim-merkle-tree \
  --network goerli \
  --nft-claim-contract 0x4c50Bd152ad12795FB7142C24685ca79aB2fF05B \
  --file './tmp/whitelist.csv' \
  --output './tmp/whitelist-merkel-tree.json'
```

| account                                    | tokens |
| ------------------------------------------ | ------ |
| 0x39bb6a99cae924e67c10209746b096Cec7B23a89 | 3      |
| 0x11B69263c11D887AD8F9Dc7e2D94513D3A9ce233 | 4      |
| 0x24a4fDC05359e8103E34F281019606F65933193d | 2      |

```json
{
  "root": "0xd7a137e1f17c413f295d70045a6a30e02cb989d70592c469f9fde9597927c939",
  "proofs": {
    "0x39bb6a99cae924e67c10209746b096Cec7B23a89": {
      "tokens": "3",
      "proof": [
        "0x7441941ad5e4fa07f7b11005890f1705f14ae8e56ba99acd4e3e716970534af8",
        "0xda80650d04fccb7a633862bd11677f32962614ccbc40634d42540ade5f53a675"
      ]
    },
    "0x11B69263c11D887AD8F9Dc7e2D94513D3A9ce233": {
      "tokens": "4",
      "proof": [
        "0x09815ddd7c4485065e0d2771823f92c41fc26992cb441307d977303291a2aaa2",
        "0xda80650d04fccb7a633862bd11677f32962614ccbc40634d42540ade5f53a675"
      ]
    },
    "0x24a4fDC05359e8103E34F281019606F65933193d": {
      "tokens": "2",
      "proof": ["0xd52f9887f9e7f2a93be08972fa0e4b8361e1fdf25b6a299b14a192c1e427db9c"]
    }
  }
}
```

### Add Merkel Root

```ps1
npx hardhat nft-claim:add-merkle-tree-root \
  --network goerli \
  --nft-claim-contract 0x4c50Bd152ad12795FB7142C24685ca79aB2fF05B \
  --root 0xd7a137e1f17c413f295d70045a6a30e02cb989d70592c469f9fde9597927c939 \
  --gas-limit  100000

> 'Add Merkle Tree Root Transaction: 0xf1689c9a62f1e84a2487149376c546dee37cc03cd0abd96578a3014b1d227016'
```

- [Transaction](https://goerli.etherscan.io/tx/0xf1689c9a62f1e84a2487149376c546dee37cc03cd0abd96578a3014b1d227016)

## Box NFT

### Deploy NFT

### Deploy Unbox Contract

### Unbox
