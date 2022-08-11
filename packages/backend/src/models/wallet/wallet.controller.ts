import { Controller, Post, Body } from '@nestjs/common';

import { WalletService } from './wallet.service';

import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WalletBodyDto } from './dto/create-wallet.dto';
import { UserDto } from 'models/user/dto';

@ApiTags('Wallets')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @ApiOperation({
    description: 'Creates wallet and assigns to user with passed `userId`',
  })
  @ApiBody({ type: WalletBodyDto })
  @ApiOkResponse({ type: UserDto })
  async create(@Body() createWalletDto: WalletBodyDto) {
    return this.walletService.createWallet(createWalletDto);
  }
}
