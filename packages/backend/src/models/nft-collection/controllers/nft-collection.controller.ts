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
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NftCollectionDto } from '../dto/nft-collection.dto';
import { Auth } from 'common/decorators/auth.decorators';
import { Role } from 'common/enums/role.enum';

@ApiTags('NftCollections')
@Controller('nft-collection')
export class NftCollectionController {
  constructor(private readonly nftCollectionService: NftCollectionService) {}

  @Auth(Role.NFT_ADMIN)
  @Delete(':id')
  @ApiOperation({ description: 'Deletes an Nft collection with given `id`' })
  @ApiOkResponse({ type: NftCollectionDto })
  @ApiExcludeEndpoint()
  remove(@Param('id') id: string) {
    return this.nftCollectionService.remove(id);
  }

  @Get(':id')
  @ApiOperation({ description: 'Returns an Nft collection with given `id`' })
  @ApiOkResponse({ type: NftCollectionDto })
  @ApiExcludeEndpoint()
  findOne(@Param('id') id: string) {
    return this.nftCollectionService.findById(id);
  }

  @Get()
  @ApiOperation({ description: 'Returns a list of Nft collections' })
  @ApiOkResponse({ type: [NftCollectionDto], schema: { type: 'array' } })
  @ApiExcludeEndpoint()
  findAll(@Query() query, @GetPagination() pagination: Pagination) {
    return this.nftCollectionService.findAll({ ...query, ...pagination });
  }

  @Auth(Role.NFT_ADMIN)
  @Patch(':id')
  @ApiOperation({ description: 'Updates an Nft collection with given `id`' })
  @ApiOkResponse({ type: NftCollectionDto })
  @ApiBody({ type: UpdateNftCollectionDto })
  @ApiExcludeEndpoint()
  update(
    @Param('id') id: string,
    @Body() updateNftCollectionDto: UpdateNftCollectionDto,
  ) {
    return this.nftCollectionService.update(id, updateNftCollectionDto);
  }

  @Auth(Role.NFT_ADMIN)
  @Post()
  @ApiOperation({ description: 'Creates an Nft collection' })
  @ApiOkResponse({ type: CreateNftCollectionDto })
  @ApiBody({ type: CreateNftCollectionDto })
  @ApiExcludeEndpoint()
  create(@Body() createNftCollectionDto: CreateNftCollectionDto) {
    return this.nftCollectionService.create(createNftCollectionDto);
  }
}
