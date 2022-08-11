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
import { Auth } from 'common/decorators/auth.decorators';
import { Role } from 'common/enums/role.enum';
import { NftCollectionService } from 'models/nft-collection';
import { WalletBodyDto } from 'models/wallet/dto/create-wallet.dto';

@ApiTags('Nfts')
@Controller('nft')
export class NftController {
  constructor(
    private readonly nftService: NftService,
    private readonly nftCollectionService: NftCollectionService,
  ) {}

  @Auth(Role.NFT_ADMIN)
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

  @Get('findByAddress/:chain/:asset/:address')
  @ApiOperation({ description: 'Returns an Nft from a specific Token Address' })
  async findByAddress(
    @Param('chain') chain: string,
    @Param('asset') asset: string,
    @Param('address') address: string,
  ) {
    // TODO add ApiOkResponse
    if (chain !== 'solana') return null; // TODO support other chains
    const collections = await this.nftCollectionService.findAll({ query: [] });

    const result = await this.nftService.findByAddress(address);

    const collectionAddresses = collections.data.map(
      (collection) => collection.assetTypes[0].assetName.reference,
    );

    return collectionAddresses.includes(result.collectionAddress)
      ? result
      : null;
  }

  @Get('findAllByWallet/:wallet')
  @ApiOperation({ description: "Returns a list of Nfts in a user's wallet" })
  async findAllByWallet(@Query() query, @Param('wallet') wallet: string) {
    // TODO add ApiOkResponse
    const result = await this.nftService.findAllByWallet({ ...query }, wallet);
    const collections = await this.nftCollectionService.findAll({ query: [] });
    const collectionAddresses = collections.data.map(
      (collection) => collection.assetTypes[0].assetName.reference,
    );

    return result.filter((nft) =>
      collectionAddresses.includes(nft.collectionAddress),
    );
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

  @Auth(Role.NFT_ADMIN)
  @Patch(':id')
  @ApiOperation({ description: 'Update an Nft with provided `id`' })
  @ApiOkResponse({ type: NftDto })
  update(@Param('id') id: string, @Body() updateNftDto: UpdateNftDto) {
    return this.nftService.update(id, updateNftDto);
  }

  @Auth(Role.NFT_ADMIN)
  @Post()
  @ApiOperation({ description: 'Creates an Nft' })
  @ApiOkResponse({ type: NftDto })
  @ApiBody({ type: CreateNftDto })
  create(@Body() createNftDto: CreateNftDto) {
    return this.nftService.create(createNftDto);
  }

  @Post('mint')
  @ApiOperation({
    description: 'Mints an Nft and returns the transaction hash',
  })
  @ApiOkResponse({ type: String })
  @ApiBody({ type: WalletBodyDto })
  mint(@Body() walletBodyDto: WalletBodyDto) {
    return this.nftService.mint(walletBodyDto);
  }
}
