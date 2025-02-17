import { WalletServiceDto } from '@common/dto/venly.dto'
import { AssetIdDto } from '@common/types/caip'
import { VenlyService } from '@services/utils/venly.service'

import { mockNftEvm } from './nft.mock'
import { mockUser } from './user.mock'

export const nonFungibleResponse = {
  success: true,
  result: [
    {
      id: '73',
      name: 'Accept our cookie policy - #10',
      description:
        'This digital puzzle piece is one of 5 of its kind. There are 11 other pieces to complete the puzzle, which was physically created by PIAB and designed by Musketon. When you collect all 12 pieces you can exchange them for the complete design. Puzzle complete? Contact us at info@puzzleinabag.com to get the full design.',
      url: 'https://www.puzzleinabag.com/',
      backgroundColor: null,
      imageUrl: 'https://img.arkane.network/marketing/PIAB/2021-Musketon-01/NFT10.png',
      imagePreviewUrl: 'https://img.arkane.network/marketing/PIAB/2021-Musketon-01/NFT10.png',
      imageThumbnailUrl: 'https://img.arkane.network/marketing/PIAB/2021-Musketon-01/NFT10.png',
      animationUrl: null,
      animationUrls: [],
      fungible: false,
      maxSupply: 5,
      contract: {
        name: 'Puzzle in a Bag',
        description:
          "PIAB, or Puzzle in a Bag, is a Ghentian start-up company looking to make puzzling cool again, which is why we're selling the first ever physical puzzle turned into NFTs. We create culturally relevant puzzles that contain fun, out-of-the-box references to the topic of every puzzle.",
        address: '0x2aaaee990f595f21a88c1264f57d617ece271bd3',
        symbol: 'PIAB',
        url: 'https://www.puzzleinabag.com',
        imageUrl: 'https://img.arkane.network/marketing/PIAB/logo.png',
        media: [
          {
            type: 'image',
            value: 'https://img.arkane.network/marketing/PIAB/banner.png'
          },
          {
            type: 'instagram',
            value: 'https://www.instagram.com/puzzleinabag/?hl=en'
          },
          {
            type: 'linkedin',
            value: 'https://www.linkedin.com/company/puzzle-in-a-bag/'
          },
          {
            type: 'facebook',
            value: 'https://www.facebook.com/puzzleinabag/'
          }
        ],
        type: 'ERC_1155',
        verified: false,
        premium: false,
        categories: []
      },
      attributes: [
        {
          type: 'property',
          name: 'Artist',
          value: 'Musketon',
          displayType: null,
          traitCount: null,
          maxValue: null
        },
        {
          type: 'property',
          name: 'Release date',
          value: '2021',
          displayType: null,
          traitCount: null,
          maxValue: null
        },
        {
          type: 'property',
          name: 'Edition',
          value: '1',
          displayType: null,
          traitCount: null,
          maxValue: null
        },
        {
          type: 'property',
          name: 'Piece',
          value: '#10 of 12',
          displayType: null,
          traitCount: null,
          maxValue: null
        }
      ],
      balance: 1
    },
    {
      id: '52',
      name: 'Barry The Henn',
      description:
        'Barry is Chucks older borther of The Chicken Siblings. He is Cool, Daring and Wacky. He can be Selfish and Stubborn When it Comes To Challenges, But he is An True Softie when it Comes To His Siblings. In Rebel to the Beak, It revealed that He is Allergic to Monstonuts and In The Good, The Bad and The Clucky, It also Revealed that He Used to Be one Of the Scouts from Slurp,s Little Cowboys Scout Camp along With Finley, Ainta and Hugo. He is the youngest of the three.',
      url: 'https://en.wikipedia.org/wiki/Space_Chickens_in_Space',
      backgroundColor: null,
      imageUrl:
        'https://static.wikia.nocookie.net/parody/images/4/42/74915084_10162764640400387_6139958579186106368_o.jpg',
      imagePreviewUrl:
        'https://static.wikia.nocookie.net/parody/images/4/42/74915084_10162764640400387_6139958579186106368_o.jpg',
      imageThumbnailUrl:
        'https://static.wikia.nocookie.net/parody/images/4/42/74915084_10162764640400387_6139958579186106368_o.jpg',
      animationUrl: null,
      animationUrls: [],
      fungible: false,
      maxSupply: null,
      contract: {
        name: 'Space Chickens',
        description:
          'Space Chickens in Space is an American-Australian-Mexican-British-Irish animated television series produced by Ánima Estudios in Mexico, Studio Moshi in Australia. A trio of chickens—Chuck, Starley and Finley—are taken from their home and mistakenly enrolled in an elite intergalactic former military academy. It would take all their strength, and teamwork, to survive every escapade they have.',
        address: '0xd3343d667d8d2c1c9dc6fe36d2b3f6b569e4d08b',
        symbol: 'SPACECHICKS',
        url: 'https://en.wikipedia.org/wiki/Space_Chickens_in_Space',
        imageUrl:
          'https://static.wikia.nocookie.net/logopedia/images/a/aa/Space_Chickens_in_Space.jpg',
        media: [
          {
            type: 'image',
            value: 'https://dg31sz3gwrwan.cloudfront.net/fanart/355763/1357791-0-q80.jpg'
          }
        ],
        type: 'ERC_1155',
        verified: false,
        premium: false,
        categories: []
      },
      attributes: [
        {
          type: 'property',
          name: 'Talent',
          value: 'Leadership',
          displayType: null,
          traitCount: null,
          maxValue: null
        },
        {
          type: 'property',
          name: 'Allergic',
          value: 'Monstonuts',
          displayType: null,
          traitCount: null,
          maxValue: null
        },
        {
          type: 'property',
          name: 'Hobby',
          value: 'Scouts',
          displayType: null,
          traitCount: null,
          maxValue: null
        }
      ],
      balance: 5
    }
  ]
}

export const tokenBalnceResponse = {
  success: true,
  result: [
    {
      tokenAddress: '0x2d7882bedcbfddce29ba99965dd3cdf7fcb10a1e',
      rawBalance: '1000000000000000000',
      balance: 1.0,
      decimals: 18,
      symbol: 'TST',
      logo: 'https://img.arkane.network/tokens/matic/testnet/logos/0x2d7882bedcbfddce29ba99965dd3cdf7fcb10a1e.png',
      type: 'ERC_20',
      transferable: true
    }
  ]
}

export const transactionResponse = {
  success: true,
  result: [
    {
      transactionHash: '3c58e866f9fdda95fab25d71e700e765'
    }
  ]
}

export const createWalletResponse = {
  success: true,
  result: [
    { pincode: '123456', identifier: mockUser.uuid, secretType: 'MATIC', walletType: 'WHITE_LABEL' }
  ]
}

export const getWalletResponse = {
  success: true,
  result: {
    id: '6ddcbcc3-e242-4bb5-b4f3-3913ccba3e8d',
    address: '0xd7A742EFa8f3b24bc39EF288C2eEf3f1F6956a60',
    walletType: 'WHITE_LABEL',
    secretType: 'ETHEREUM',
    createdAt: '2021-01-14T13:17:42.301523',
    archived: false,
    alias: 'magnetic_horse',
    description: 'Just another test Wallet',
    primary: false,
    hasCustomPin: true,
    identifier: 'arkane-created-wallet',
    balance: {
      available: true,
      secretType: 'ETHEREUM',
      balance: 1.0,
      gasBalance: 0.0,
      symbol: 'ETH',
      gasSymbol: 'ETH',
      rawBalance: '1',
      rawGasBalance: '0',
      decimals: 18
    }
  }
}

export const mockVenlyService: Partial<VenlyService> = {
  getTokenBalance: jest.fn().mockImplementation(async ({ walletId, token }) => {
    if (!walletId && !token) throw new Error('Required data missing')
    return tokenBalnceResponse.result
  }),
  upgrade: jest.fn().mockImplementation(async ({ walletId, assetId, value, pincode }) => {
    if (!pincode && !walletId && !assetId && !value) throw new Error('Required data missing')
    return transactionResponse.result
  }),
  unbox: jest.fn().mockImplementation(async (assetId: AssetIdDto) => {
    if (!assetId) throw new Error('Required data missing')
    return transactionResponse.result
  }),
  createWallet: jest.fn().mockImplementation(async ({ pincode, uuid }: WalletServiceDto) => {
    if (!pincode || !uuid) throw new Error('Required data missing')
    return createWalletResponse.result
  }),
  getWallet: jest.fn().mockImplementation(async (walletId: string) => {
    return [getWalletResponse].find((wallet) => wallet.result.id === walletId)?.result
  }),
  mint: jest.fn().mockImplementation(async () => {
    return mockNftEvm
  }),
  approveNft: jest.fn().mockImplementation(async () => {
    return '0x00'
  }),
  topUp: jest.fn().mockImplementation(async (walletId: string, address: string) => {
    if (!walletId || !address) throw new Error('Required data missing')
    return 'SUCCEEDED'
  })
}
