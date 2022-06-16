import { Order, OrderHistory } from 'common/entities';
import { define } from 'typeorm-seeding';

import { faker } from '@faker-js/faker';
import { OrderStatus } from 'common/enums';

interface Context {
  orders: Order[];
}

define(OrderHistory, (_, { orders }: Context) => {
  const orderHistory = new OrderHistory();

  const order = faker.helpers.arrayElement(orders);
  orderHistory.orderId = order.id;
  orderHistory.userId = order.buyerId;
  orderHistory.currentStatus = order.status;
  orderHistory.lastStatus = faker.helpers.arrayElement([
    OrderStatus.CANCELLED,
    OrderStatus.CLOSED,
    OrderStatus.OPEN,
  ]);

  return orderHistory;
});
