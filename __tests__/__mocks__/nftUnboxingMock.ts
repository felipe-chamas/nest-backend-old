import { NftUnboxingDto } from '@common/schemas/nft-unboxing.schema'

export const nftLegendaryBox: NftUnboxingDto = {
  assetType: {
    chainId: {
      namespace: 'eip155',
      reference: '97'
    },
    assetName: {
      namespace: 'erc721',
      reference: '0x42759D4A168BE0c518C4fBB2518Ee329E848f5Bd'
    }
  },
  nfts: ['0x955FA0B94aF588Bfd0669e965B2A464943Ce3267'], //ability card testnet address
  tokenCount: [2]
}
