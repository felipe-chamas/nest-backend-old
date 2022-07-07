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
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetPagination, Pagination } from 'common/decorators';
import { Auth } from 'common/decorators/auth.decorators';
import { Role } from 'common/enums/role.enum';
import { CreateNftClaimDto } from '../dto/create-nft-claim.dto';
import { NftClaimDto } from '../dto/nft-claim.dto';
import { UpdateNftClaimDto } from '../dto/update-nft-claim.dto';
import { NftClaimService } from '../services/nft-claim.service';

@Controller('nft-claim')
export class NftClaimController {
  constructor(private readonly nftClaimService: NftClaimService) {}

  @Auth(Role.NFT_ADMIN)
  @Post()
  @ApiOperation({ description: 'Creates an Nft Calim ' })
  @ApiOkResponse({ type: NftClaimDto })
  @ApiBody({ type: CreateNftClaimDto })
  create(@Body() createNftClaimDto: CreateNftClaimDto) {
    return this.nftClaimService.create(createNftClaimDto);
  }

  @Get()
  @ApiOperation({ description: 'Returns a list of Nft Claimed ' })
  @ApiOkResponse({ type: [NftClaimDto] })
  findAll(@Query() query, @GetPagination() pagination: Pagination) {
    return this.nftClaimService.findAll({ ...query, ...pagination });
  }

  @Get(':id')
  @ApiOperation({ description: 'Gets an Nft Claimed with given `id`' })
  @ApiOkResponse({ type: NftClaimDto })
  async findOne(@Param('id') id: string) {
    return this.nftClaimService.findById(id);
  }

  @Auth(Role.NFT_ADMIN)
  @Patch(':id')
  @ApiOperation({ description: 'Updates an Nft Claimed with given `id`' })
  @ApiOkResponse({ type: NftClaimDto })
  @ApiBody({ type: UpdateNftClaimDto })
  update(
    @Param('id') id: string,
    @Body() updateNftClaimDto: UpdateNftClaimDto,
  ) {
    return this.nftClaimService.update(id, updateNftClaimDto);
  }

  @Auth(Role.NFT_ADMIN)
  @Delete(':id')
  @ApiOperation({ description: 'Deletes an Nft Claimed with given `id`' })
  @ApiOkResponse({ type: NftClaimDto })
  remove(@Param('id') id: string) {
    return this.nftClaimService.remove(id);
  }
}
