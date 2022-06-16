import { NftCollection } from 'common/entities';
import { define } from 'typeorm-seeding';

import { faker } from '@faker-js/faker';

define(NftCollection, () => {
  const nftCollection = new NftCollection();

  nftCollection.name = faker.word.noun(2);
  nftCollection.externalUrl = faker.internet.url();
  nftCollection.icon = faker.image.abstract(64, 64);
  nftCollection.imageBaseUri = faker.image.imageUrl();

  return nftCollection;
});
