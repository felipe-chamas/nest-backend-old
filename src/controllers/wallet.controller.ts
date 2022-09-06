import { Controller, Post, Body } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { Auth } from '@common/decorators/auth.decorators'
import { WalletResponseDto } from '@common/dto/wallet.dto'
import { Role } from '@common/enums/role.enum'
import { WalletService } from '@services/wallet.service'

import { WalletBodyDto } from '../common/dto/create-wallet.dto'

@ApiTags('Wallets')
@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Auth(Role.USER_ADMIN)
  @Post()
  @ApiOperation({
    description: 'Creates wallet and assigns to user with passed `userId`'
  })
  @ApiBody({ type: WalletBodyDto })
  @ApiCreatedResponse()
  @ApiOkResponse({ type: WalletResponseDto })
  async create(@Body() createWalletDto: WalletBodyDto) {
    const wallet = await this.walletService.createWallet(createWalletDto)
    // TODO actually do this conversion
    return wallet as unknown as WalletResponseDto
  }
}
