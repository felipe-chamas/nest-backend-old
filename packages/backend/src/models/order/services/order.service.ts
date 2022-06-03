import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, FindManyOptions, ObjectID, Repository } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { Order, OrderHistory } from 'common/entities';
import { OrderStatus } from 'common/enums';
import { Pagination } from 'common/decorators';
import { recoveryAgent } from 'common/utils';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderHistory)
    private readonly orderHistoryRepo: Repository<OrderHistory>
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const order = this.orderRepo.create(createOrderDto);
    const newOrder = await this.orderRepo.save(order);

    const orderHistory = this.orderHistoryRepo.create({
      orderId: newOrder.id,
      currentStatus: OrderStatus.OPEN,
    });

    await this.orderRepo.save(orderHistory);

    return newOrder;
  }

  async findAll(options?: FindManyOptions<Order> | Pagination) {
    const orders = await this.orderRepo.find(options);
    const orderHistories = await this.orderHistoryRepo.find();

    return orders.map((order) => {
      const orderHistory = orderHistories.find(
        (orderHistory) => orderHistory.orderId === order.id
      );
      return { ...order, ...orderHistory };
    });
  }

  async findOne(conditions: FindConditions<Order>) {
    let order: Order;
    if (conditions?.id)
      order = await this.orderRepo.findOne(String(conditions.id));
    else order = await this.orderRepo.findOne(conditions);

    if (!order) throw new NotFoundException(`Order not found`);

    const orderHistory = await this.orderHistoryRepo.findOne({
      orderId: order.id,
    });

    return { order, orderHistory };
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderRepo.findOne(id);

    if (!order) throw new NotFoundException(`Order with id ${id} not found`);

    Object.assign(order, updateOrderDto);

    const updatedOrder = await this.orderRepo.save(order);
    const orderHistory = await this.orderHistoryRepo.findOne({
      orderId: updatedOrder.id,
    });

    orderHistory.lastStatus = orderHistory.currentStatus;
    orderHistory.currentStatus = updatedOrder.status;

    await this.orderRepo.save(orderHistory);

    return { order: updatedOrder, orderHistory };
  }

  async remove(id: string) {
    const order = await this.orderRepo.findOne(id);

    if (!order) throw new NotFoundException(`Order with id ${id} not found`);

    return await this.orderRepo.softRemove(order);
  }

  async recover(id?: ObjectID) {
    return await recoveryAgent(this.orderRepo, id);
  }
}
