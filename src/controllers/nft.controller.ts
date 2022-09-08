import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger'
import { AssetId, ChainId } from 'caip'

import { Auth } from '@common/decorators/auth.decorators'
import { GetPagination, Pagination } from '@common/decorators/pagination.decorators'
import { CreateNftDto } from '@common/dto/create-nft.dto'
import {
  NFTWalletBodyDto,
  PayableNFTWalletBodyDto,
  WalletBodyDto
} from '@common/dto/create-wallet.dto'
import { UpdateNftDto } from '@common/dto/update-nft.dto'
import { Role } from '@common/enums/role.enum'
import { NftDto } from '@common/schemas/nft.schema'
import { NftCollectionService } from '@services/nft-collection.service'
import { NftService } from '@services/nft.service'

@ApiTags('Nfts')
@Controller()
export class NftController {
  constructor(
    private readonly nftService: NftService,
    private readonly nftCollectionService: NftCollectionService
  ) {}

  @Auth(Role.NFT_ADMIN)
  @Delete(':id')
  @ApiOperation({ description: 'Delete an Nft with provided `id`' })
  @ApiOkResponse({ type: NftDto })
  @ApiExcludeEndpoint()
  remove(@Param('id') id: string) {
    return this.nftService.remove(id)
  }

  @Get()
  @ApiOperation({ description: 'Returns a list of Nfts' })
  @ApiOkResponse({ type: [NftDto], schema: { type: 'array' } })
  findAll(@Query() query, @GetPagination() pagination: Pagination) {
    return this.nftService.findAll({ ...query, ...pagination })
  }

  @Get('findByAddress/:chain/:asset/:address')
  @ApiExcludeEndpoint()
  @ApiOperation({ description: 'Returns an Nft from a specific Token Address' })
  async findByAddress(
    @Param('chain') chain: string,
    @Param('asset') asset: string,
    @Param('address') address: string
  ) {
    // TODO add ApiOkResponse
    if (chain === 'solana') {
      const collections = await this.nftCollectionService.findAll({ skip: 0, limit: 10, sort: {} })
      const result = await this.nftService.findByAddress(address)
      const collectionAddresses = collections.data
        .map((collection) => [
          ...collection.assetTypes
            .filter((type) => type.chainId.namespace === 'solana')
            .map((type) => type.assetName.reference)
        ])
        .flat()

      return collectionAddresses.includes(result.collectionAddress) ? result : null
    } else {
      return this.nftService.findByContractAddressAndTokenIdEvm(chain, asset, address)
    }
  }

  @Get('wallet/:wallet')
  @ApiOperation({ description: "Returns a list of Nfts in a user's wallet" })
  @ApiOkResponse({ type: [NftDto] })
  async findAllByWallet(
    @Query() query: { limit?: number; page?: number; cursor?: string },
    @Param('wallet') walletAddress: string
  ) {
    // TODO add ApiOkResponse
    const [namespace, reference, address] = walletAddress.split(':')

    const chainId = new ChainId({
      namespace,
      reference
    })

    const collectionAddresses = await this.nftCollectionService.findAddressesByChainId(chainId)

    if (namespace === 'solana') {
      const result = await this.nftService.findAllBySolanaWallet({ ...query }, address)
      return result.filter((nft) => collectionAddresses.includes(nft.collectionAddress))
    } else {
      const network = `${namespace}:${reference}`
      return this.nftService.findAllByEvmWallet(
        address,
        network,
        collectionAddresses,
        query.page,
        query.limit,
        query.cursor
      )
    }
  }

  @Get(':id')
  @ApiOperation({ description: 'Returns an Nft with provided `id`' })
  @ApiOkResponse({ type: NftDto })
  @ApiExcludeEndpoint()
  findOne(@Param('id') id: string) {
    return this.nftService.findById(id)
  }

  @Get(':chainId/:assetName/:tokenId')
  @ApiExcludeEndpoint()
  @ApiOperation({
    description: [
      'Returns an Nft with provided `chainId`, `assetName` and `tokenId` information.',
      'This is the intended route for setting the baseUri on the smart contracts'
    ].join('<br/>')
  })
  @ApiOkResponse({ type: NftDto })
  async findOneByParams(
    @Param('chainId') chainId: string,
    @Param('assetName') assetName: string,
    @Param('tokenId') tokenId: string
  ) {
    const assetId = new AssetId({ chainId, assetName, tokenId })
    const nft = await this.nftService.findByAssetId(assetId)
    return nft.metadata
  }

  @Auth(Role.NFT_ADMIN)
  @Patch(':id')
  @ApiOperation({ description: 'Update an Nft with provided `id`' })
  @ApiOkResponse({ type: NftDto })
  @ApiExcludeEndpoint()
  update(@Param('id') id: string, @Body() updateNftDto: UpdateNftDto) {
    return this.nftService.update(id, updateNftDto)
  }

  @Auth(Role.NFT_ADMIN)
  @Post()
  @ApiOperation({ description: 'Creates an Nft' })
  @ApiOkResponse({ type: NftDto })
  @ApiBody({ type: CreateNftDto })
  @ApiExcludeEndpoint()
  create(@Body() createNftDto: CreateNftDto) {
    return this.nftService.create(createNftDto)
  }

  @Auth(Role.NFT_ADMIN)
  @Post('mint')
  @ApiOperation({
    description: 'Mints an Nft and returns the transaction hash'
  })
  @ApiOkResponse({
    type: String
  })
  @ApiExcludeEndpoint()
  @ApiCreatedResponse()
  @ApiBody({ type: WalletBodyDto })
  mint(@Body() bodyDto: WalletBodyDto) {
    return this.nftService.mint(bodyDto)
  }

  @Auth(Role.NFT_ADMIN)
  @Post('unbox')
  @ApiOperation({
    description: 'Unboxes an Nft and returns the transaction hash'
  })
  @ApiOkResponse({ type: String })
  @ApiBody({ type: NFTWalletBodyDto })
  unbox(@Body() bodyDto: NFTWalletBodyDto) {
    return this.nftService.unbox(bodyDto)
  }

  @Auth(Role.NFT_ADMIN)
  @Post('upgrade')
  @ApiOperation({
    description: 'Upgrades an Nft and returns the transaction hash'
  })
  @ApiOkResponse({ type: String })
  @ApiBody({ type: PayableNFTWalletBodyDto })
  upgrade(@Body() bodyDto: PayableNFTWalletBodyDto) {
    return this.nftService.upgrade(bodyDto)
  }
}
