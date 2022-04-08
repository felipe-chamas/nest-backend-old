import { CreateNftCollectionDto } from '../../models/nft-collection/dto/create-nft-collection.dto';
import { NftCollection } from '../../models/nft-collection/entities/nft-collection.entity';

export const mockNftCollection: NftCollection = {
  id: '624b40189c5293c6f75945f1',
  name: '#nftCode',
  nfts: [],
};

export const mockCreateNftCollection: CreateNftCollectionDto = {
  name: '#nftCode',
};
