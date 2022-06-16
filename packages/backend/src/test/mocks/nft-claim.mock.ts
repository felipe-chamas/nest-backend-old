import { UpdateNftClaimDto } from '../../models/nft-claim/dto/update-nft-claim.dto';
import { ObjectID } from 'typeorm';
import { NftClaim } from 'common/entities';
import { CreateNftClaimDto } from 'models/nft-claim/dto/create-nft-claim.dto';

export const mockCreateNftClaim: CreateNftClaimDto = {
  nftCollectionId: '624b40189c5293c6f75945f1' as unknown as ObjectID,
  merkleRoot:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  merkleProofs: {
    '0x0000000000000000000000000000000000000000': {
      tokens: '1',
      proof: [
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
      ],
    },
  },
  metadata: {
    name: 'jellyfish',
    description: 'a jellyfish',
    image: 'https://example.com/image.jpg',
    attributes: [
      {
        trait_type: 'ears',
        value: 'tiny',
      },
    ],
  },
};

export const mockUpdateNftClaim: UpdateNftClaimDto = {
  nftCollectionId: '624b40189c5293c6f75945f1' as unknown as ObjectID,
  merkleRoot:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  merkleProofs: {
    '0x0000000000000000000000000000000000000000': {
      tokens: '1',
      proof: [
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
      ],
    },
  },
  metadata: {
    name: 'jellyfish',
    description: 'a jellyfish',
    image: 'https://example.com/image.jpg',
    attributes: [
      {
        trait_type: 'ears',
        value: 'tiny',
      },
    ],
  },
};

export const mockCreateNftClaimResponse: Partial<NftClaim> = {
  id: '624b40189c5293c6f75945f1' as unknown as ObjectID,
  nftCollectionId: '624b40189c5293c6f75945f1' as unknown as ObjectID,
  merkleRoot:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  merkleProofs: {
    '0x0000000000000000000000000000000000000000': {
      tokens: '1',
      proof: [
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
      ],
    },
  },
  metadata: {
    name: 'jellyfish',
    description: 'a jellyfish',
    image: 'https://example.com/image.jpg',
    attributes: [
      {
        trait_type: 'ears',
        value: 'tiny',
      },
    ],
  },
};

export const mockNftClaim: Partial<NftClaim> = {
  id: '624b40189c5293c6f75945f1' as unknown as ObjectID,
  nftCollectionId: '624b40189c5293c6f75945f1' as unknown as ObjectID,
  merkleRoot:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  merkleProofs: {
    '0x0000000000000000000000000000000000000000': {
      tokens: '1',
      proof: [
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
      ],
    },
  },
  metadata: {
    name: 'jellyfish',
    description: 'a jellyfish',
    image: 'https://example.com/image.jpg',
    attributes: [
      {
        trait_type: 'ears',
        value: 'tiny',
      },
    ],
  },
};
