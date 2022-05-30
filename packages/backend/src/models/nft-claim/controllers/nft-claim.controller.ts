import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GetPagination, Pagination } from 'common/decorators';
import { CreateNftClaimDto } from '../dto/create-nft-claim.dto';
import { UpdateNftClaimDto } from '../dto/update-nft-claim.dto';
import { NftClaimService } from '../services/nft-claim.service';

@Controller('nft-claim')
export class NftClaimController {
  constructor(private readonly nftClaimService: NftClaimService) {}

  @Post()
  create(@Body() createNftClaimDto: CreateNftClaimDto) {
    return this.nftClaimService.create(createNftClaimDto);
  }

  @Get()
  findAll(@GetPagination() pagination: Pagination) {
    return this.nftClaimService.findAll(pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.nftClaimService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNftClaimDto: UpdateNftClaimDto
  ) {
    return this.nftClaimService.update(id, updateNftClaimDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nftClaimService.remove(id);
  }
}
