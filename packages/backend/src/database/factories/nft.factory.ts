import { Nft, NftClaim, User } from 'common/entities';
import { define } from 'typeorm-seeding';
import { faker } from '@faker-js/faker';

import { AssetId } from 'caip';
import { ChainIdReference } from 'common/types';

interface Context {
  users: User[];
  nftClaims: NftClaim[];
}

define(Nft, (_, { users, nftClaims }: Context) => {
  const nft = new Nft();

  const chainId = ChainIdReference.BINANCE_TESTNET;

  const assetId = new AssetId({
    chainId,
    assetName: {
      namespace: 'erc721',
      reference: faker.finance.ethereumAddress(),
    },
    tokenId: faker.datatype
      .float({ min: 1, max: 100, precision: 1 })
      .toString(),
  });

  nft.assetIds = [assetId];

  const nftClaim = faker.helpers.arrayElement(nftClaims);

  nft.userId = faker.helpers.arrayElement(users).id;
  nft.nftCollectionId = nftClaim.nftCollectionId;
  nft.metadata = nftClaim.metadata;

  return nft;
});
