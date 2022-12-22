import { Controller, Post, Body, Get, Param, Query, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger'
import { AccountId, AssetType } from 'caip'

import { Auth } from '@common/decorators/auth.decorators'
import { Role } from '@common/enums/role.enum'
import { UserService } from '@services/user.service'
import { EvmService } from '@services/utils/evm.service'
import { VenlyService } from '@services/utils/venly.service'

import {
  MintWalletBodyDto,
  NFTTransferBodyDto,
  NFTWalletBodyDto,
  PayableNFTWalletBodyDto
} from '../common/dto/venly.dto'

@ApiTags('Game Control')
@Controller()
export class NftGameController {
  constructor(
    private readonly userService: UserService,
    private readonly venlyService: VenlyService,
    private readonly evmService: EvmService,
    private readonly config: ConfigService
  ) {}

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
  @ApiBody({ type: MintWalletBodyDto })
  async mint(@Body() { uuid, pincode, assetType }: MintWalletBodyDto) {
    const user = await this.userService.findByUUID(uuid)
    const walletId = user.wallet.id
    const walletAddress = user.wallet.address
    return this.venlyService.mint({
      walletId,
      walletAddress,
      pincode,
      assetType: new AssetType(assetType)
    })
  }

  @Auth(Role.NFT_ADMIN)
  @Post('unbox')
  @ApiOperation({
    description: 'Unboxes an Nft and returns the transaction hash'
  })
  @ApiOkResponse({ type: String })
  @ApiBody({ type: NFTWalletBodyDto })
  async unbox(@Body() { assetId, uuid, pincode }: NFTWalletBodyDto) {
    if (uuid) {
      const user = await this.userService.findByUUID(uuid)
      if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)

      const to = this.config.get('unbox.contractAddress') as string
      await this.venlyService.approveNft(
        user.wallet.id,
        pincode,
        assetId.assetName.reference,
        assetId.tokenId,
        to
      )
    }

    return this.venlyService.unbox(assetId)
  }

  @Auth(Role.NFT_ADMIN)
  @Post('upgrade')
  @ApiOperation({
    description: 'Upgrades an Nft and returns the transaction hash'
  })
  @ApiOkResponse({ type: String })
  @ApiBody({ type: PayableNFTWalletBodyDto })
  async upgrade(@Body() { uuid, assetId, value, pincode }: PayableNFTWalletBodyDto) {
    const user = await this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)

    const walletId = user.wallet.id

    return this.venlyService.upgrade({ walletId, assetId, value, pincode })
  }

  @Auth(Role.USER_ADMIN, Role.OWNER)
  @Get('user/:uuid/nft')
  @ApiOperation({ description: 'Returns user nfts' })
  @ApiParam({ name: 'uuid', type: String })
  async getUserNfts(@Param('uuid') uuid: string, @Query() { nfts }) {
    const user = await this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)
    const walletAddress = user.wallet?.address
    if (walletAddress) {
      const accountId = new AccountId({
        address: walletAddress,
        chainId: {
          namespace: 'eip155',
          reference: this.config.get('stage') === 'production' ? '56' : '97'
        }
      })
      return await this.evmService.getAccountNfts(accountId, nfts)
    } else return []
  }

  @Auth(Role.USER_ADMIN)
  @Get('user/:uuid/balance')
  @ApiOperation({ description: 'Returns user token balance' })
  @ApiParam({ name: 'uuid', type: String })
  async getUserBalance(@Param('uuid') uuid: string, @Query() { token }) {
    const user = await this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)
    const walletId = user.wallet?.id
    if (walletId) {
      return this.venlyService.getTokenBalance({ walletId, token })
    }
    return null
  }

  @Auth(Role.NFT_ADMIN, Role.OWNER)
  @Post('user/:uuid/nft/transfer')
  @ApiOperation({
    description: 'transfer NFTs to other wallet'
  })
  @ApiOkResponse({ type: String })
  @ApiBody({ type: NFTTransferBodyDto })
  @ApiParam({ name: 'uuid', type: String })
  async transfer(
    @Body() { pincode, assetIds, to }: NFTTransferBodyDto,
    @Param('uuid') uuid: string
  ) {
    const user = await this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)

    const { id: walletId, address: venlyAddress } = user.wallet

    return this.venlyService.transfer(venlyAddress, to, assetIds, pincode, walletId)
  }
}
