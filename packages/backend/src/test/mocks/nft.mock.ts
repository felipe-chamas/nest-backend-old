import { CreateNftDto } from '../../models/nft/dto/create-nft.dto';

export const mockCreateNft = {
  userId: '624b3c3adb4b27a36fc4d450',
  nftCollectionId: '624b40189c5293c6f75945f1',
  properties: {
    base: 'jellyfish',
    rich_property: {
      name: 'ears',
      value: 'tiny',
      display_value: 'small',
    },
  },
} as unknown as CreateNftDto;

export const mockCreateNftResponse = {
  properties: {
    base: 'jellyfish',
    rich_property: {
      name: 'ears',
      value: 'tiny',
      display_value: 'small',
    },
  },
  userId: '624b3c3adb4b27a36fc4d450',
  nftCollectionId: '624b40189c5293c6f75945f1',
  id: '624f2d18a5883560a662cdd8',
};

export const mockNft = {
  id: '624b466796780a1276e70e53',
  properties: {
    base: 'starfish',
    rich_property: {
      name: 'eyes',
      value: 'big',
      display_value: 'Big',
    },
  },
  userId: '624b3c3adb4b27a36fc4d450',
  nftCollectionId: '624b40189c5293c6f75945f1',
};
