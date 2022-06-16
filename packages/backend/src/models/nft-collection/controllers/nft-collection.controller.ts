import { Request } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { NftCollectionService } from '../services/nft-collection.service';
import { CreateNftCollectionDto } from '../dto/create-nft-collection.dto';
import { UpdateNftCollectionDto } from '../dto/update-nft-collection.dto';
import { GetPagination, Pagination } from 'common/decorators';

@Controller('nft-collection')
export class NftCollectionController {
  constructor(private readonly nftCollectionService: NftCollectionService) {}

  @Post()
  create(@Body() createNftCollectionDto: CreateNftCollectionDto) {
    return this.nftCollectionService.create(createNftCollectionDto);
  }

  @Get()
  findAll(@Query() query: Request, @GetPagination() pagination: Pagination) {
    return this.nftCollectionService.findAll({ ...query, ...pagination });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nftCollectionService.findOne({ id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNftCollectionDto: UpdateNftCollectionDto,
  ) {
    return this.nftCollectionService.update(id, updateNftCollectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nftCollectionService.remove(id);
  }
}
