import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NftService } from './nft.service';
import { CreateNftDto } from './dto/create-nft.dto';
import { UpdateNftDto } from './dto/update-nft.dto';
import { NftCollectionService } from 'models/nft-collection/nft-collection.service';

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
  findAll() {
    return this.nftService.findAll();
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
    } as unknown);
    return nft.metadata;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.nftService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNftDto: UpdateNftDto) {
    return this.nftService.update(id, updateNftDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nftService.remove(id);
  }
}
