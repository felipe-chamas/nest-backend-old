import { Nft, Order, User } from 'common/entities';
import { define } from 'typeorm-seeding';

import { faker } from '@faker-js/faker';
import { OrderStatus } from 'common/enums';

interface Context {
  users: User[];
  nfts: Nft[];
}

define(Order, (_, { users, nfts }: Context) => {
  const order = new Order();

  order.buyerId = faker.helpers.arrayElement(users).id;
  order.sellerId = faker.helpers.arrayElement(users).id;
  order.nftId = faker.helpers.arrayElement(nfts).id;
  order.price = faker.datatype.float({ min: 1, max: 100 }).toString();
  order.fee = faker.datatype.float({ min: 1, max: 100 }).toString();
  order.status = faker.helpers.arrayElement([
    OrderStatus.CANCELLED,
    OrderStatus.CLOSED,
    OrderStatus.OPEN,
  ]);

  return order;
});
