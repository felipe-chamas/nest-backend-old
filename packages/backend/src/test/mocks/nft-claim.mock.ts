import { UpdateNftClaimDto } from '../../models/nft-claim/dto/update-nft-claim.dto';
import { CreateNftClaimDto } from '../../models/nft-claim/dto/create-nft-claim.dto';

export const mockCreateNftClaim = {
  nftCollectionId: '624b40189c5293c6f75945f1',
  merkleRoot:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  merkleProofs: {
    '0x0000000000000000000000000000000000000000': {
      tokens: 1,
      proof: [
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
      ],
    },
  },
  metadata: {
    base: 'jellyfish',
    rich_property: {
      name: 'ears',
      value: 'tiny',
      display_value: 'small',
    },
  },
} as unknown as CreateNftClaimDto;

export const mockUpdateNftClaim = {
  nftCollectionId: '624b40189c5293c6f75945f1',
  merkleRoot:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  merkleProofs: {
    '0x0000000000000000000000000000000000000000': {
      tokens: 1,
      proof: [
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
      ],
    },
  },
  metadata: {
    base: 'jellyfish',
    rich_property: {
      name: 'ears',
      value: 'tiny',
      display_value: 'small',
    },
  },
} as unknown as UpdateNftClaimDto;

export const mockCreateNftClaimResponse = {
  id: '624b40189c5293c6f75945f1',
  nftCollectionId: '624b40189c5293c6f75945f1',
  merkleRoot:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  merkleProofs: {
    '0x0000000000000000000000000000000000000000': {
      tokens: 1,
      proof: [
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
      ],
    },
  },
  metadata: {
    base: 'jellyfish',
    rich_property: {
      name: 'ears',
      value: 'tiny',
      display_value: 'small',
    },
  },
};

export const mockNftClaim = {
  id: '624b40189c5293c6f75945f1',
  nftCollectionId: '624b40189c5293c6f75945f1',
  merkleRoot:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  merkleProofs: {
    '0x0000000000000000000000000000000000000000': {
      tokens: 1,
      proof: [
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
      ],
    },
  },
  metadata: {
    base: 'jellyfish',
    rich_property: {
      name: 'ears',
      value: 'tiny',
      display_value: 'small',
    },
  },
};
