import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NftService } from '../services/nft.service';
import { CreateNftDto } from '../dto/create-nft.dto';
import { UpdateNftDto } from '../dto/update-nft.dto';
import { ObjectID } from 'typeorm';
import { NftCollectionService } from 'models/nft-collection';
import { GetPagination, Pagination } from 'common/decorators';

@Controller('nft')
export class NftController {
  constructor(
    private readonly nftCollectionService: NftCollectionService,
    private readonly nftService: NftService
  ) {}

  @Post()
  create(@Body() createNftDto: CreateNftDto) {
    return this.nftService.create(createNftDto);
  }

  @Get()
  findAll(@GetPagination() pagination: Pagination) {
    return this.nftService.findAll(pagination);
  }

  @Get(':nftCollectionSlug/:tokenId')
  async findOneByParams(
    @Param('nftCollectionSlug') nftCollectionSlug: string,
    @Param('tokenId') tokenId: string
  ) {
    const nftCollection = await this.nftCollectionService.findOne({
      slug: nftCollectionSlug,
    });

    const nftCollectionId = nftCollection.id.toString();
    const nft = await this.nftService.findOne({
      nftCollectionId,
      tokenId,
    });
    return nft.metadata;
  }

  @Get(':id')
  findOne(@Param('id') id: ObjectID) {
    return this.nftService.findOne({ id });
  }

  @Patch(':id')
  update(@Param('id') id: ObjectID, @Body() updateNftDto: UpdateNftDto) {
    return this.nftService.update(id, updateNftDto);
  }

  @Delete(':id')
  remove(@Param('id') id: ObjectID) {
    return this.nftService.remove(id);
  }
}
