import { Metadata } from 'models/nft/interface';

export function getMetadataFromRoot(root: string): Metadata {
  const map: Record<string, Metadata> = {
    '0x5fa72c03e63446247eedd77e7cfc0eea9c0665d4ab9c105345206683f8b69144': {
      name: 'Gamer Primal (1K)',
      description:
        'Emote given to the players as special thanks for reaching 1K users on discord',
      image: '1k.png',
      attributes: [
        { trait_type: 'Rarity', value: 'Ultimate' },
        { trait_type: 'Civilization', value: 'Ancients' },
        { trait_type: 'Category', value: 'Community' },
      ],
    },
    '0x0': {
      name: 'Gamer Primal (10K)',
      description:
        'Emote given to the players as special thanks for reaching 10K users on discord',
      image: '2k.png',
      attributes: [
        { trait_type: 'Rarity', value: 'Ultimate' },
        { trait_type: 'Civilization', value: 'Ancients' },
        { trait_type: 'Category', value: 'Community' },
      ],
    },
    '0x1': {
      name: 'Gamer Primal (50K)',
      description:
        'Emote given to the players as special thanks for reaching 50K users on discord',
      image: '50k.png',
      attributes: [
        { trait_type: 'Rarity', value: 'Ultimate' },
        { trait_type: 'Civilization', value: 'Ancients' },
        { trait_type: 'Category', value: 'Community' },
      ],
    },
    '0x2': {
      name: 'Gamer Primal (100K)',
      description:
        'Emote given to the players as special thanks for reaching 100K users on discord',
      image: '100k.png',
      attributes: [
        { trait_type: 'Rarity', value: 'Ultimate' },
        { trait_type: 'Civilization', value: 'Ancients' },
        { trait_type: 'Category', value: 'Community' },
      ],
    },
    '0x3': {
      name: 'Gamer Primal (500K)',
      description:
        'Emote given to the players as special thanks for reaching 500K users on discord',
      image: '500k.png',
      attributes: [
        { trait_type: 'Rarity', value: 'Ultimate' },
        { trait_type: 'Civilization', value: 'Ancients' },
        { trait_type: 'Category', value: 'Community' },
      ],
    },
  };

  return map[root];
}
