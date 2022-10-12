import { Controller, Post, Body, Get, Param, Query, NotFoundException } from '@nestjs/common'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger'

import { Auth } from '@common/decorators/auth.decorators'
import { Role } from '@common/enums/role.enum'
import { UserService } from '@services/user.service'
import { VenlyService } from '@services/utils/venly.service'

import { NFTWalletBodyDto, PayableNFTWalletBodyDto, WalletBodyDto } from '../common/dto/venly.dto'

@ApiTags('Game Control')
@Controller()
export class NftGameController {
  constructor(
    private readonly userService: UserService,
    private readonly venlyService: VenlyService
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
  @ApiBody({ type: WalletBodyDto })
  async mint(@Body() { uuid, pincode }: WalletBodyDto) {
    const user = await this.userService.findByUUID(uuid)
    const walletId = user.wallet.id
    const walletAddress = user.wallet.address
    return this.venlyService.mint({ walletId, walletAddress, pincode })
  }

  @Auth(Role.NFT_ADMIN)
  @Post('unbox')
  @ApiOperation({
    description: 'Unboxes an Nft and returns the transaction hash'
  })
  @ApiOkResponse({ type: String })
  @ApiBody({ type: NFTWalletBodyDto })
  async unbox(@Body() { uuid, assetId, pincode }: NFTWalletBodyDto) {
    const user = await this.userService.findByUUID(uuid)
    const walletId = user.wallet.id
    return this.venlyService.unbox({ walletId, assetId, pincode })
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
    const walletId = user.wallet.id
    return this.venlyService.upgrade({ walletId, assetId, value, pincode })
  }

  @Auth(Role.USER_ADMIN)
  @Get('user/:uuid/nft')
  @ApiOperation({ description: 'Returns user nfts' })
  @ApiParam({ name: 'uuid', type: String })
  async getUserNfts(@Param('uuid') uuid: string, @Query() { nfts }) {
    const user = await this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)
    const walletId = user.wallet?.id
    const userNfts = await this.venlyService.getNfts({ walletId, nfts })
    return userNfts
  }

  @Auth(Role.USER_ADMIN)
  @Get('user/:uuid/balance')
  @ApiOperation({ description: 'Returns user token balance' })
  @ApiParam({ name: 'uuid', type: String })
  async getUserBalance(@Param('uuid') uuid: string, @Query() { token }) {
    const user = await this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)
    const walletId = user.wallet?.id
    const userNfts = await this.venlyService.getTokenBalance({ walletId, token })
    return userNfts
  }
}
