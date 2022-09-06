import { CreateNftDto } from '@common/dto/create-nft.dto'
import { UpdateNftDto } from '@common/dto/update-nft.dto'

export const mockCreateNft = {
  id: '624b3c3adb4b27a36fc4d450',
  userId: '624b3c3adb4b27a36fc4d450',
  nftCollectionId: '624b40189c5293c6f75945f1',
  metadata: {
    base: 'jellyfish',
    rich_property: {
      name: 'ears',
      value: 'tiny',
      display_value: 'small'
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
} as unknown as CreateNftDto

export const mockUpdateNft = {
  userId: '624b3c3adb4b27a36fc4d450',
  nftCollectionId: '624b40189c5293c6f75945f1',
  metadata: {
    base: 'jellyfish',
    rich_property: {
      name: 'ears',
      value: 'tiny',
      display_value: 'small'
    }
  }
} as unknown as UpdateNftDto

export const mockCreateNftResponse = {
  metadata: {
    base: 'jellyfish',
    rich_property: {
      name: 'ears',
      value: 'tiny',
      display_value: 'small'
    }
  },
  userId: '624b3c3adb4b27a36fc4d450',
  nftCollectionId: '624b40189c5293c6f75945f1',
  id: '624b3c3adb4b27a36fc4d450'
}

export const mockNft = {
  id: '624b466796780a1276e70e53',
  metadata: {
    base: 'starfish',
    rich_property: {
      name: 'eyes',
      value: 'big',
      display_value: 'Big'
    }
  },
  userId: '624b3c3adb4b27a36fc4d450',
  nftCollectionId: '624b40189c5293c6f75945f1'
}
