import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  InternalServerErrorException,
  Param,
  ParseArrayPipe,
  Post,
  Query,
  Session,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AccountId, AssetId, AssetType, ChainId } from 'caip'
import { SessionData } from 'express-session'

import { NftDto } from '@common/dto/nft.dto'
import { ChainIdReference } from '@common/enums/caip.enum'
import { BridgeService } from '@services/bridge.service'
import { NftCollectionService } from '@services/nft-collection.service'
import { UserService } from '@services/user.service'
import { EvmService } from '@services/utils/evm.service'
import { SolanaService } from '@services/utils/solana.service'
import { VenlyService } from '@services/utils/venly.service'

@ApiTags('Nfts')
@Controller()
export class NftController {
  constructor(
    private readonly nftCollectionService: NftCollectionService,
    private readonly userService: UserService,
    private readonly bridgeService: BridgeService,
    private readonly evmService: EvmService,
    private readonly solanaService: SolanaService,
    private readonly venlyService: VenlyService,
    private readonly config: ConfigService
  ) {}

  @Get(':chainId/:assetName/:tokenId')
  @ApiOperation({
    description: 'Returns an Nft with provided `chainId`, `assetName` and `tokenId` information.'
  })
  @ApiOkResponse({ type: NftDto })
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
  @ApiOperation({
    description: 'Returns a list of Nfts owned by `:chainId/:address`, filtered by NftCollections'
  })
  @ApiOkResponse({ type: [NftDto] })
  async findByAccount(
    @Param('chainId') chainId: string,
    @Param('address') address: string,
    @Query(
      'nftCollectionAddresses',
      new DefaultValuePipe([]),
      new ParseArrayPipe({ items: String, separator: ',' })
    )
    nftCollectionAddresses: string[]
  ) {
    const accountId = new AccountId({ chainId, address })
    nftCollectionAddresses =
      nftCollectionAddresses.length > 0
        ? nftCollectionAddresses
        : await this.nftCollectionService.findAddressesByChainId(accountId.chainId)
    switch (chainId) {
      case ChainIdReference.SOLANA_DEVNET:
      case ChainIdReference.SOLANA_TESTNET:
      case ChainIdReference.SOLANA_MAINNET:
        const nfts = await this.solanaService.getAccountNfts(accountId)

        const filteredNfts = nfts.filter((nft) =>
          nftCollectionAddresses.includes(nft.assetId.assetName.reference)
        )
        return filteredNfts
      case ChainIdReference.BINANCE_TESTNET:
      case ChainIdReference.BINANCE_MAINNET:
        return this.evmService.getAccountNfts(accountId, nftCollectionAddresses)
    }
  }

  @Post('bridge/:chainIdSource/:chainIdDestination')
  @ApiOperation({
    description: 'Bridges an NFT from one chain to another'
  })
  @ApiOkResponse({
    type: NftDto
  })
  async bridge(
    @Param('chainIdSource') chainIdSource: string,
    @Param('chainIdDestination') chainIdDestination: string,
    @Session() session: SessionData,
    @Body() { txSource, accountIdDestination }: { txSource: string; accountIdDestination: string }
  ) {
    if (!session.user) throw new UnauthorizedException()

    const { uuid } = session.user
    const user = await this.userService.findByUUID(uuid)

    if (new AccountId(accountIdDestination).chainId.toString() !== chainIdDestination) {
      throw new BadRequestException(`Invalid accountIdDestination chain ${accountIdDestination}`)
    }

    const validBridgeMap: Record<ChainIdReference, ChainIdReference> = {
      [ChainIdReference.SOLANA_DEVNET]: ChainIdReference.BINANCE_TESTNET,
      [ChainIdReference.SOLANA_TESTNET]: ChainIdReference.BINANCE_TESTNET,
      [ChainIdReference.SOLANA_MAINNET]: ChainIdReference.BINANCE_MAINNET,
      [ChainIdReference.BINANCE_TESTNET]: undefined,
      [ChainIdReference.BINANCE_MAINNET]: undefined
    }
    if (validBridgeMap[chainIdSource] !== chainIdDestination) {
      throw new BadRequestException(`Invalid bridge from ${chainIdSource} to ${chainIdDestination}`)
    }

    const bridge = await this.bridgeService.findOne({ txSource })

    if (bridge) {
      const bridgeSucceded =
        (await this.venlyService.getTxStatus(bridge.txDestination)) === 'SUCCEEDED'
      if (bridgeSucceded) {
        throw new BadRequestException(`Asset already bridged from ${chainIdSource}`)
      } else {
        throw new InternalServerErrorException(
          `Failed to mint NFT on destination chain. Try again later (${bridge.txDestination})`
        )
      }
    }

    const { from, to, nft } = await this.solanaService.getNftTransaction(
      new ChainId(chainIdSource),
      txSource
    )

    const userAccountIds = user.accountIds.map((accountId) => new AccountId(accountId).toString())
    if (!userAccountIds.includes(from.toString())) {
      throw new BadRequestException(
        `Invalid bridge from ${from.toString()} (expected ${userAccountIds.toString()})`
      )
    }

    const [
      sourceAccountId,
      sourceAssetTypes,
      destinationAssetTypes,
      destinationWalletId,
      destinationWalletPinCode,
      destinationWalletMinimumBalance
    ] = [
      this.config.get('bridge.sourceAccountId') as string,
      this.config.get('bridge.sourceAssetTypes') as string[],
      this.config.get('bridge.destinationAssetTypes') as string[],
      this.config.get('bridge.destinationWalletId') as string,
      this.config.get('bridge.destinationWalletPinCode') as string,
      this.config.get('bridge.destinationWalletMinimumBalance') as number
    ]

    if (to.toString() !== sourceAccountId) {
      throw new BadRequestException(
        `Invalid bridge to ${to.toString()} (expected ${sourceAccountId})`
      )
    }
    const nftAssetType = new AssetType({
      chainId: nft.assetId.chainId,
      assetName: nft.assetId.assetName
    }).toString()
    if (!sourceAssetTypes.includes(nftAssetType)) {
      throw new BadRequestException(
        `Invalid bridge of asset ${nftAssetType} (expected ${sourceAssetTypes.join(',')})`
      )
    }

    const destinationAssetType = destinationAssetTypes[sourceAssetTypes.indexOf(nftAssetType)]

    const hasBalance =
      (await this.venlyService.getWallet(destinationWalletId)).balance.balance >=
      destinationWalletMinimumBalance

    if (!hasBalance) {
      throw new InternalServerErrorException(
        `Insufficient balance in destination wallet minter. Try again later.`
      )
    }

    const { _id: bridgeId } = await this.bridgeService.create({ txSource })

    const txDestination = await this.venlyService.mint({
      pincode: destinationWalletPinCode,
      walletId: destinationWalletId,
      walletAddress: new AccountId(accountIdDestination).address,
      assetType: new AssetType(destinationAssetType)
    })

    await this.bridgeService.update(bridgeId, { txDestination })

    return txDestination
  }
}
