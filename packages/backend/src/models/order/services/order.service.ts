import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, MongoRepository } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { Order, OrderHistory } from 'common/entities';
import { Pagination } from 'common/decorators';
import { recoveryAgent } from 'common/utils';
import { ObjectId } from 'mongodb';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: MongoRepository<Order>,
    @InjectRepository(OrderHistory)
    private readonly orderHistoryRepo: MongoRepository<OrderHistory>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const newOrder = this.orderRepo.create(createOrderDto);
    const savedOrder = await this.orderRepo.save(newOrder);

    const orderHistory = this.orderHistoryRepo.create({
      orderId: savedOrder.id,
      currentStatus: savedOrder.status,
    });

    await this.orderHistoryRepo.save(orderHistory);

    const createdOrder = {
      id: savedOrder.id,
      status: savedOrder.status,
    };

    return {
      message: 'Order created successfully',
      createdOrder,
    };
  }

  async findAll({ query, ...options }: FindManyOptions<Order> & Pagination) {
    const orders = await this.orderRepo.find(options);
    const orderHistories = await this.orderHistoryRepo.find();

    const res = [];

    orders.forEach((order) => {
      orderHistories.find((orderHistory) => {
        if (orderHistory.orderId.toString() === order.id.toString()) {
          res.push({
            ...order,
            status: orderHistory.currentStatus,
            orderHistoryId: orderHistory.id,
          });
        }
      });
    });
    return res;
  }

  async findById(id: string) {
    const [order] = await this.orderRepo
      .aggregate<Order>([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $addFields: {
            id: '$_id',
          },
        },
      ])
      .toArray();

    if (!order) throw new NotFoundException(`Order with id ${id} not found`);

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.findById(id);

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
    const order = await this.findById(id);
    return await this.orderRepo.softRemove(order);
  }

  async recover(id?: string) {
    return await recoveryAgent(this.orderRepo, id);
  }
}
