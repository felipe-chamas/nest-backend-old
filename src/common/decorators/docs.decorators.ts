import { ApiProperty } from '@nestjs/swagger'

import { Role } from '@common/enums/role.enum'

export const ApiPropertyMetadata = () =>
  ApiProperty({
    description: 'Nft metadata',
    example: {
      name: 'Game item.',
      description: 'Description about the game item.',
      image: 'https://example.com/image.png',
      attributes: [
        {
          trait_type: 'Rarity',
          value: 'Legendary'
        }
      ]
    }
  })

export const ApiPropertyAssetId = () =>
  ApiProperty({
    description: 'Asset Id representing the `tokenId` minted on the blockchain.',
    example: {
      chainId: {
        namespace: 'solana',
        reference: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
      },
      assetName: {
        namespace: 'NonFungible',
        reference: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      },
      tokenId: '2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9'
    }
  })

export const ApiPropertyAssetIds = () =>
  ApiProperty({
    description: [
      'Asset Id array representing the `tokenId`s minted on the blockchain.',
      'This array can have more than one element in the case of the Nft being deployed on multiple chains.'
    ].join('<br/>'),
    example: [
      {
        chainId: {
          namespace: 'solana',
          reference: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
        },
        assetName: {
          namespace: 'NonFungible',
          reference: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
        },
        tokenId: '2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9'
      }
    ]
  })

export const ApiPropertyTokenUri = () =>
  ApiProperty({
    description: 'URI to get metadata from token',
    example: 'ipfs://base-token-uri/123'
  })

export const ApiPropertyUserUUID = () =>
  ApiProperty({
    type: () => String,
    description: 'User uuid.',
    example: '09649b73-9b23-4ec4-ae12-7b01891bac98'
  })

export const ApiPropertyNftId = () =>
  ApiProperty({
    type: () => String,
    example: '507f1f77bcf86cd799439011',
    description:
      'Nft id. This is not the same as the `tokenId` represented on the blockchain smart contract.'
  })

export const ApiPropertyNftCollectionId = () =>
  ApiProperty({
    type: () => String,
    description: 'Nft collection id.',
    example: '507f1f77bcf86cd799439011'
  })

export const ApiPropertyCreatedAt = () =>
  ApiProperty({
    description: 'Created date (automatically set).',
    type: () => String,
    example: '2022-07-05T14:12:34.567Z'
  })

export const ApiPropertyUpdatedAt = () =>
  ApiProperty({
    description: 'Updated date (automatically set).',
    type: () => String,
    example: '2022-07-06T14:12:34.567Z'
  })

export const ApiPropertyDeletedAt = () =>
  ApiProperty({
    description: 'Deleted date (automatically set).',
    type: () => String,
    example: '2022-07-07T14:12:34.567Z'
  })

export const ApiPropertyAssetTypes = () =>
  ApiProperty({
    type: () => [Object],
    description: [
      'Asset types.',
      'Corresponds to where this collection is deployed on the blockchain, with `chainId` and `assetName` references.'
    ].join('<br/>'),
    example: [
      {
        chainId: {
          namespace: 'solana',
          reference: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
        },
        assetName: {
          namespace: 'NonFungible',
          reference: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
        }
      }
    ]
  })

export const ApiPropertyNftCollectionSlug = () =>
  ApiProperty({
    description: [
      'Nft collection slug.',
      'Uniquely user-friendly name intended to identify the Nft collection.'
    ].join('<br/>'),
    example: 'cryptokitties'
  })

export const ApiPropertyNftCollectionIcon = () =>
  ApiProperty({
    description: 'Nft collection icon.',
    example: 'https://example.com/image.png'
  })

export const ApiPropertyNftCollectionName = () =>
  ApiProperty({
    description: 'Nft collection name.',
    example: 'CryptoKitties'
  })

export const ApiPropertyNftCollectionImageBaseUri = () =>
  ApiProperty({
    description: 'Image base URI for Nfts belonging to this Nft collection.',
    example: 'https://example.com/cryptokitties/image/'
  })

export const ApiPropertyNftCollectionExternalUrl = () =>
  ApiProperty({
    description: 'External URL. Redirects to more details about the Nft collection.',
    example: 'https://example.com/cryptokitties/'
  })

export const ApiPropertyNftCollectionNfts = () =>
  ApiProperty({
    description: 'List of Nfts from this Nft collection'
  })

export const ApiPropertyUserName = () =>
  ApiProperty({
    description: 'User name.',
    example: 'Vitalik Buterin'
  })

export const ApiPropertyUserEmail = () =>
  ApiProperty({
    example: 'vitalik@ethereum.org',
    description: 'User email.'
  })

export const ApiPropertyUserRoles = () =>
  ApiProperty({
    enum: Role,
    description: [
      'User roles.',
      'By default, this array is non existent or empty and the user is not allowed to interact with anything other than their own profile information.'
    ].join('<br/>'),
    example: ['NFT_ADMIN']
  })

export const ApiPropertyUserAccountIds = () =>
  ApiProperty({
    description: [
      'User acount ids.',
      'List of accounts (wallets) the user has connected to the platform. This list may include accounts in many different networks.',
      'There is no "master" account, all accounts have the same privileges with regard to user permissions.'
    ].join('<br/>'),
    example: [
      {
        chainId: {
          namespace: 'solana',
          reference: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
        },
        address: '2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9'
      }
    ]
  })

export const ApiPropertyUserSocialAccounts = () =>
  ApiProperty({
    type: () => [Object],
    description: [
      'Social Accounts information.',
      'This property is only present on users that have connected their social accounts.'
    ].join('<br/>'),
    example: [
      {
        discord: {
          id: '364990825698837451',
          reference: 'vitalik#1234'
        },
        steam: {
          id: '263930811698332411',
          username: 'vitalik_buterin'
        }
      }
    ]
  })

export const ApiPropertyAvatarUrl = () =>
  ApiProperty({
    description: 'Avatar URL.',
    example: 'https://example.com/image.png'
  })

export const ApiPropertyUserNfts = () =>
  ApiProperty({
    description: 'List of user Nfts'
  })

export const ApiPropertyWallet = () =>
  ApiProperty({
    description: 'Wallet',
    example: {
      id: '507f1f77bcf86cd799439011',
      address: '0xab5801a7d398351b8be11c439e05c5b3259aec9b',
      walletType: 'WHITE_LABEL',
      secretType: 'BSC',
      identifier: '523d7be5-8001-4954-aa96-f717413dfad7'
    }
  })

export const ApiPropertyWalletId = () =>
  ApiProperty({
    type: () => String,
    description: 'Wallet id.',
    example: '507f1f77bcf86cd799439011'
  })

export const ApiPropertyWalletAddress = () =>
  ApiProperty({
    description: 'Wallet address.',
    example: '0xab5801a7d398351b8be11c439e05c5b3259aec9b'
  })

export const ApiPropertyWalletType = () =>
  ApiProperty({
    description: 'Wallet type.',
    example: 'WHITE_LABEL'
  })

export const ApiPropertyWalletSecretType = () =>
  ApiProperty({
    description: 'Wallet secret type.',
    example: 'ETHEREUM'
  })

export const ApiPropertyWalletIdentifier = () =>
  ApiProperty({
    description: 'Wallet identifier used to create the wallet (user id)',
    example: '507f1f77bcf86cd799439011'
  })

export const ApiPropertyWalletDescription = () =>
  ApiProperty({
    description: 'Wallet description',
    example: 'Wallet'
  })

export const ApiPropertyWalletCreatedAt = () =>
  ApiProperty({
    description: 'Created date (automatically set).',
    type: () => String,
    example: '2022-07-05T14:12:34.567Z'
  })

export const ApiPropertyWalletGameTokenBalance = () =>
  ApiProperty({
    description: 'Wallet balance in Game Tokens.',
    type: () => String,
    example: '42.123'
  })

export const ApiPropertyValue = () =>
  ApiProperty({
    description: 'Payable blockchain value to execute function',
    type: () => String,
    example: '42.123'
  })
