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
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { NftCollectionDto } from '../dto/nft-collection.dto';
import { Roles } from 'common/decorators/roles.decorators';
import { Role } from 'common/enums/role.enum';

@Controller('nft-collection')
export class NftCollectionController {
  constructor(private readonly nftCollectionService: NftCollectionService) {}

  @Roles(Role.NFT_ADMIN)
  @Post()
  @ApiOperation({ description: 'Creates an Nft Collection' })
  @ApiOkResponse({ type: CreateNftCollectionDto })
  @ApiBody({ type: CreateNftCollectionDto })
  create(@Body() createNftCollectionDto: CreateNftCollectionDto) {
    return this.nftCollectionService.create(createNftCollectionDto);
  }

  @Get()
  @ApiOperation({ description: 'Returns a list of Nft Collection' })
  @ApiOkResponse({ type: [NftCollectionDto], schema: { type: 'array' } })
  findAll(@Query() query: Request, @GetPagination() pagination: Pagination) {
    return this.nftCollectionService.findAll({ ...query, ...pagination });
  }

  @Get(':id')
  @ApiOperation({ description: 'Returns an Nft Collection with given `id`' })
  @ApiOkResponse({ type: NftCollectionDto })
  findOne(@Param('id') id: string) {
    return this.nftCollectionService.findOne({ id });
  }

  @Roles(Role.NFT_ADMIN)
  @Patch(':id')
  @ApiOperation({ description: 'Updates an Nft Collection with given `id`' })
  @ApiOkResponse({ type: NftCollectionDto })
  @ApiBody({ type: UpdateNftCollectionDto })
  update(
    @Param('id') id: string,
    @Body() updateNftCollectionDto: UpdateNftCollectionDto,
  ) {
    return this.nftCollectionService.update(id, updateNftCollectionDto);
  }

  @Roles(Role.NFT_ADMIN)
  @Delete(':id')
  @ApiOperation({ description: 'Deletes an Nft Collection with given `id`' })
  @ApiOkResponse({ type: NftCollectionDto })
  remove(@Param('id') id: string) {
    return this.nftCollectionService.remove(id);
  }
}
