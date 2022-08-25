import { Controller, Post, Body, Get, Param } from '@nestjs/common';

import { WalletService } from './wallet.service';

import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { WalletBodyDto } from './dto/create-wallet.dto';
import { WalletResponseDto } from 'common/types/wallet';
import { Serialize } from 'common/interceptors';
import { Auth } from 'common/decorators/auth.decorators';
import { Role } from 'common/enums/role.enum';

@ApiTags('Wallets')
@Controller('wallet')
@Serialize(WalletResponseDto)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Auth(Role.USER_ADMIN)
  @Get(':id')
  @ApiOperation({ description: 'Returns a Wallet' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: WalletResponseDto })
  async findOne(@Param('id') id: string) {
    const wallet = await this.walletService.findById(id);
    // TODO actually do this conversion
    return wallet as unknown as WalletResponseDto;
  }

  @Auth(Role.USER_ADMIN)
  @Post()
  @ApiOperation({
    description: 'Creates wallet and assigns to user with passed `userId`',
  })
  @ApiBody({ type: WalletBodyDto })
  @ApiCreatedResponse()
  @ApiOkResponse({ type: WalletResponseDto })
  async create(@Body() createWalletDto: WalletBodyDto) {
    const wallet = await this.walletService.createWallet(createWalletDto);
    // TODO actually do this conversion
    return wallet as unknown as WalletResponseDto;
  }
}
