import { User } from 'common/entities';
import { define } from 'typeorm-seeding';
import { faker } from '@faker-js/faker';
import { Keypair } from '@solana/web3.js';
import { AccountId } from 'caip';

import { Role } from 'common/enums/role.enum';
import { ChainIdReference } from 'common/types';

interface Context extends Partial<User> {
  chainId?: ChainIdReference;
}

const getAddress = (chainId: ChainIdReference): string => {
  switch (chainId) {
    case ChainIdReference.ETHEREUM_MAINNET:
    case ChainIdReference.GOERLI_TESTNET:
    case ChainIdReference.BINANCE_MAINNET:
    case ChainIdReference.BINANCE_TESTNET:
      return faker.finance.ethereumAddress();
    case ChainIdReference.SOLANA_TESTNET:
    case ChainIdReference.SOLANA_DEVNET:
    case ChainIdReference.SOLANA_MAINNET:
      return Keypair.generate().publicKey.toBase58();
  }
};

const getChainId = () =>
  faker.helpers.arrayElement([
    ChainIdReference.ETHEREUM_MAINNET,
    ChainIdReference.GOERLI_TESTNET,
    ChainIdReference.BINANCE_MAINNET,
    ChainIdReference.BINANCE_TESTNET,
    ChainIdReference.SOLANA_TESTNET,
    ChainIdReference.SOLANA_DEVNET,
    ChainIdReference.SOLANA_MAINNET,
  ]);

define(User, (_, { chainId = getChainId(), ...userData }: Context) => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  const address = getAddress(chainId);
  const accountId = new AccountId({
    chainId,
    address,
  });

  const user = new User();
  user.name = userData.name ?? `${firstName} ${lastName}`;
  user.email = userData.email ?? faker.internet.email();
  user.accountIds = userData.accountIds ?? [accountId];
  user.roles =
    userData.roles ??
    faker.helpers.arrayElements(
      [
        Role.MARKETPLACE_ADMIN,
        Role.NFT_ADMIN,
        Role.ROLE_ADMIN,
        Role.USER_ADMIN,
      ],
      faker.datatype.float({ min: 0, max: 1, precision: 1 }),
    );

  return user;
});
