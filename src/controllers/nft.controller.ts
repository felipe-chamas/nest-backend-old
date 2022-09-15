import { Controller, Get, Param } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AccountId, AssetId, AssetType } from 'caip'

import { ChainIdReference } from '@common/enums/caip.enum'
import { NftCollectionService } from '@services/nft-collection.service'
import { EvmService } from '@services/utils/evm.service'
import { SolanaService } from '@services/utils/solana.service'

@ApiTags('Nfts')
@Controller()
export class NftController {
  constructor(
    private readonly nftCollectionService: NftCollectionService,
    private readonly evmService: EvmService,
    private readonly solanaService: SolanaService
  ) {}

  @Get(':chainId/:assetName/:tokenId')
  @ApiExcludeEndpoint()
  @ApiOperation({
    description: 'Returns an Nft with provided `chainId`, `assetName` and `tokenId` information.'
  })
  @ApiOkResponse({})
  async findOne(
    @Param('chainId') chainId: string,
    @Param('assetName') assetName: string,
    @Param('tokenId') tokenId: string
  ) {
    const assetId = new AssetId({ chainId, assetName, tokenId })
    const assetType = new AssetType({ chainId, assetName })
    if (!(await this.nftCollectionService.findByAssetType(assetType))) return null
    switch (chainId) {
      case ChainIdReference.SOLANA_DEVNET:
      case ChainIdReference.SOLANA_TESTNET:
      case ChainIdReference.SOLANA_MAINNET:
        return this.solanaService.getNft(assetId)
      case ChainIdReference.BINANCE_TESTNET:
      case ChainIdReference.BINANCE_MAINNET:
        return this.evmService.getNft(assetId)
    }
  }

  @Get(':chainId/:address')
  async findByAccount(@Param('chainId') chainId: string, @Param('address') address: string) {
    const accountId = new AccountId({ chainId, address })
    const nftCollectionAddresses = await this.nftCollectionService.findAddressesByChainId(
      accountId.chainId
    )
    switch (chainId) {
      case ChainIdReference.SOLANA_DEVNET:
      case ChainIdReference.SOLANA_TESTNET:
      case ChainIdReference.SOLANA_MAINNET:
        const nfts = await this.solanaService.getAccountNfts(accountId)
        const filteredNfts = nfts.filter((nft) =>
          nftCollectionAddresses.includes(nft.collectionAddress)
        )
        return filteredNfts
      case ChainIdReference.BINANCE_TESTNET:
      case ChainIdReference.BINANCE_MAINNET:
        return this.evmService.getAccountNfts(accountId, nftCollectionAddresses)
    }
  }
}
