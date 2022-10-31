import { NftDto } from '@common/dto/nft.dto'

export const mockNftEvm: Partial<NftDto> = {
  assetId: {
    chainId: {
      namespace: 'eip155',
      reference: '97'
    },
    assetName: {
      namespace: 'erc721',
      reference: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    },
    tokenId: '16'
  },
  tokenUri: 'https://nft-info/box/1',
  metadata: {
    name: 'Legendary Box.',
    description: 'Information about the box.',
    image: 'https://nft-images/box/box.png',
    attributes: [
      {
        trait_type: 'Rare Cards',
        value: '3'
      }
    ]
  }
}

export const mockNftSolana: Partial<NftDto> = {
  assetId: {
    chainId: {
      namespace: 'solana',
      reference: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z'
    },
    assetName: {
      namespace: 'erc721',
      reference: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    },
    tokenId: '16'
  },
  tokenUri: 'https://nft-info/box/1',
  metadata: {
    name: 'Legendary Box.',
    description: 'Information about the box.',
    image: 'https://nft-images/box/box.png',
    attributes: [
      {
        trait_type: 'Rare Cards',
        value: '3'
      }
    ]
  }
}
