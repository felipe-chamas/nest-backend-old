import { NftClaim, NftCollection, User } from 'common/entities';
import { define } from 'typeorm-seeding';

import { faker } from '@faker-js/faker';
import { randomHexString } from '@ethersproject/testcases';
import { Metadata } from '../../models/nft/interface';
import { MerkleProofs } from '../../models/nft-claim/types';

interface Context {
  seeder?: 'harvest' | 'random';
  users: User[];
  nftCollections: NftCollection[];
}

const randomMerkleRoot = (): string => randomHexString(faker.random.word(), 32);

const randomMetadata = (): Metadata => ({
  name: faker.word.noun(),
  description: faker.lorem.paragraph(),
  image: faker.image.imageUrl(),
  external_url: faker.internet.url(),
  attributes: faker.datatype
    .array(faker.datatype.float({ min: 0, max: 3, precision: 1 }))
    .map(() => ({
      trait_type: faker.word.noun(),
      value: faker.datatype.float({ min: 0, max: 10 }).toString(),
    })),
});

const randomMerkleProofs = (users: User[]): MerkleProofs => {
  const merkleProofs: MerkleProofs = {};

  faker.helpers.arrayElements(users).forEach((user) => {
    merkleProofs[user.accountIds[0].address] = {
      proof: [randomHexString(faker.random.word(), 32)],
      tokens: faker.random.numeric(1),
    };
  });
  return merkleProofs;
};

define(NftClaim, (_, { users, nftCollections }: Context) => {
  const nftClaim = new NftClaim();

  nftClaim.merkleRoot = randomMerkleRoot();
  nftClaim.metadata = randomMetadata();
  nftClaim.merkleProofs = randomMerkleProofs(users);
  nftClaim.nftCollectionId = faker.helpers.arrayElement(nftCollections).id;

  return nftClaim;
});
