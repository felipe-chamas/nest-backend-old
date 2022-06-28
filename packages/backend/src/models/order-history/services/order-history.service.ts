import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, MongoRepository } from 'typeorm';
import { CreateOrderHistoryDto } from '../dto/create-order-history.dto';
import { UpdateOrderHistoryDto } from '../dto/update-order-history.dto';
import { Order, OrderHistory } from 'common/entities';
import { Pagination } from 'common/decorators';
import { recoveryAgent } from 'common/utils';
import { ObjectId } from 'mongodb';
@Injectable()
export class OrderHistoryService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: MongoRepository<Order>,
    @InjectRepository(OrderHistory)
    private readonly orderHistoryRepo: MongoRepository<OrderHistory>,
  ) {}

  async create(createOrderHistoryDto: CreateOrderHistoryDto) {
    const orderHistory = this.orderHistoryRepo.create(createOrderHistoryDto);
    return this.orderHistoryRepo.save(orderHistory);
  }

  async findAll({
    query,
    ...options
  }: FindManyOptions<OrderHistory> & Pagination) {
    return await this.orderHistoryRepo.find(options);
  }

  async findById(id: string) {
    const [orderHistory] = await this.orderHistoryRepo
      .aggregate<OrderHistory>([
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

    if (!orderHistory)
      throw new NotFoundException(`OrderHistory with id ${id} not found`);

    return orderHistory;
  }

  async update(id: string, updateOrderHistoryDto: UpdateOrderHistoryDto) {
    const orderHistory = await this.findById(id);
    Object.assign(orderHistory, updateOrderHistoryDto);
    return await this.orderHistoryRepo.save(orderHistory);
  }

  async remove(id: string) {
    const orderHistory = await this.findById(id);
    return await this.orderHistoryRepo.softRemove(orderHistory);
  }

  async recover(id?: string) {
    return await recoveryAgent(this.orderHistoryRepo, id);
  }
}
