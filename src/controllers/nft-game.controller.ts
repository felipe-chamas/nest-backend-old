import { Controller, Post, Body } from '@nestjs/common'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger'

import { Auth } from '@common/decorators/auth.decorators'
import { Role } from '@common/enums/role.enum'
import { UserService } from '@services/user.service'
import { VenlyService } from '@services/utils/venly.service'

import {
  NFTWalletBodyDto,
  PayableNFTWalletBodyDto,
  WalletBodyDto
} from '../common/dto/create-wallet.dto'

@ApiTags('Wallets')
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
  async mint(@Body() { uuid, ...body }: WalletBodyDto) {
    const user = await this.userService.findByUUID(uuid)
    const walletId = user.wallet.id
    const walletAddress = user.wallet.address
    return this.venlyService.mint({ walletId, walletAddress, ...body })
  }

  @Auth(Role.NFT_ADMIN)
  @Post('unbox')
  @ApiOperation({
    description: 'Unboxes an Nft and returns the transaction hash'
  })
  @ApiOkResponse({ type: String })
  @ApiBody({ type: NFTWalletBodyDto })
  async unbox(@Body() { uuid, ...body }: NFTWalletBodyDto) {
    const user = await this.userService.findByUUID(uuid)
    const walletId = user.wallet.id
    return this.venlyService.unbox({ walletId, ...body })
  }

  @Auth(Role.NFT_ADMIN)
  @Post('upgrade')
  @ApiOperation({
    description: 'Upgrades an Nft and returns the transaction hash'
  })
  @ApiOkResponse({ type: String })
  @ApiBody({ type: PayableNFTWalletBodyDto })
  async upgrade(@Body() { uuid, ...body }: PayableNFTWalletBodyDto) {
    const user = await this.userService.findByUUID(uuid)
    const walletId = user.wallet.id
    return this.venlyService.upgrade({ walletId, ...body })
  }
}
