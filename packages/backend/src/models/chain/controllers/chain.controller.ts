import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';

import { ChainService } from '../services/chain.service';

import { ChainDto } from '../dto/chain.dto';
import { UpdateChainDto } from '../dto/update-chain.dto';

import { Serialize } from 'common/interceptors';

import { GetPagination, Pagination } from 'common/decorators';
import { Auth } from 'common/decorators/auth.decorators';
import { Role } from 'common/enums/role.enum';

@Controller('chain')
@Serialize(ChainDto)
export class ChainController {
  constructor(private readonly chainService: ChainService) {}

  @Auth(Role.CHAIN_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chainService.remove(id);
  }

  @Auth(Role.CHAIN_ADMIN)
  @Get()
  findAll(@GetPagination() pagination: Pagination) {
    return this.chainService.findAll(pagination);
  }

  @Auth(Role.CHAIN_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chainService.findById(id);
  }

  @Auth(Role.CHAIN_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChainDto: UpdateChainDto) {
    return this.chainService.update(id, updateChainDto);
  }
}
