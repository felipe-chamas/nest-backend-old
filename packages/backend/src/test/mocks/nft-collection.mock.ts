import { CreateNftCollectionDto } from '../../models/nft-collection/dto/create-nft-collection.dto';
import { NftCollection } from '../../models/nft-collection/entities/nft-collection.entity';

export const mockNftCollection = {
  id: '624b40189c5293c6f75945f1',
  name: '#nftCode',
  nfts: [],
} as unknown as NftCollection;

export const mockCreateNftCollection = {
  name: '#nftCode',
} as unknown as CreateNftCollectionDto;
