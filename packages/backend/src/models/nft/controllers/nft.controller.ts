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
import { GetPagination, Pagination } from 'common/decorators';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NftDto } from '../dto/nft.dto';
import { AssetId } from 'caip';
import { Roles } from 'common/decorators/roles.decorators';
import { Role } from 'common/enums/role.enum';

@ApiTags('Nfts')
@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Roles(Role.NFT_ADMIN)
  @Delete(':id')
  @ApiOperation({ description: 'Delete an Nft with provided `id`' })
  @ApiOkResponse({ type: NftDto })
  remove(@Param('id') id: string) {
    return this.nftService.remove(id);
  }

  @Get()
  @ApiOperation({ description: 'Returns a list of Nfts' })
  @ApiOkResponse({ type: [NftDto], schema: { type: 'array' } })
  findAll(@Query() query, @GetPagination() pagination: Pagination) {
    return this.nftService.findAll({ ...query, ...pagination });
  }

  @Get(':id')
  @ApiOperation({ description: 'Returns an Nft with provided `id`' })
  @ApiOkResponse({ type: NftDto })
  findOne(@Param('id') id: string) {
    return this.nftService.findById(id);
  }

  @Get(':chainId/:assetName/:tokenId')
  @ApiOperation({
    description: [
      'Returns an Nft with provided `chainId`, `assetName` and `tokenId` information.',
      'This is the intended route for setting the baseUri on the smart contracts',
    ].join('<br/>'),
  })
  @ApiOkResponse({ type: NftDto })
  async findOneByParams(
    @Param('chainId') chainId: string,
    @Param('assetName') assetName: string,
    @Param('tokenId') tokenId: string,
  ) {
    const assetId = new AssetId({ chainId, assetName, tokenId });
    const nft = await this.nftService.findByAssetId(assetId);
    return nft.metadata;
  }

  @Roles(Role.NFT_ADMIN)
  @Patch(':id')
  @ApiOperation({ description: 'Update an Nft with provided `id`' })
  @ApiOkResponse({ type: NftDto })
  update(@Param('id') id: string, @Body() updateNftDto: UpdateNftDto) {
    return this.nftService.update(id, updateNftDto);
  }

  @Roles(Role.NFT_ADMIN)
  @Post()
  @ApiOperation({ description: 'Creates an Nft' })
  @ApiOkResponse({ type: NftDto })
  @ApiBody({ type: CreateNftDto })
  create(@Body() createNftDto: CreateNftDto) {
    return this.nftService.create(createNftDto);
  }
}
