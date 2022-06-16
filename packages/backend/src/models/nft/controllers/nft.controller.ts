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
import { NftService } from '../services/nft.service';
import { CreateNftDto } from '../dto/create-nft.dto';
import { UpdateNftDto } from '../dto/update-nft.dto';
import { ObjectID } from 'typeorm';
import { NftCollectionService } from 'models/nft-collection';
import { GetPagination, Pagination } from 'common/decorators';
import { AssetId } from 'caip';
import { Roles } from 'common/decorators/roles.decorators';
import { Role } from 'common/enums/role.enum';

@Controller('nft')
export class NftController {
  constructor(
    private readonly nftCollectionService: NftCollectionService,
    private readonly nftService: NftService,
  ) {}

  @Roles(Role.NFT_ADMIN)
  @Post()
  create(@Body() createNftDto: CreateNftDto) {
    return this.nftService.create(createNftDto);
  }

  @Get()
  findAll(@Query() query: Request, @GetPagination() pagination: Pagination) {
    return this.nftService.findAll({ ...query, ...pagination });
  }

  @Get(':chainId/:assetName/:tokenId')
  async findOneByParams(
    @Param('chainId') chainId: string,
    @Param('assetName') assetName: string,
    @Param('tokenId') tokenId: string,
  ) {
    const assetId = new AssetId({ chainId, assetName, tokenId });
    const nft = await this.nftService.findByAssetId(assetId);
    return nft.metadata;
  }

  @Get(':id')
  findOne(@Param('id') id: ObjectID) {
    return this.nftService.findOne({ id });
  }

  @Roles(Role.NFT_ADMIN)
  @Patch(':id')
  update(@Param('id') id: ObjectID, @Body() updateNftDto: UpdateNftDto) {
    return this.nftService.update(id, updateNftDto);
  }

  @Roles(Role.NFT_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: ObjectID) {
    return this.nftService.remove(id);
  }
}
