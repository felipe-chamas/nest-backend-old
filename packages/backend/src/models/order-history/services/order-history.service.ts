import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Repository } from 'typeorm';
import { CreateOrderHistoryDto } from '../dto/create-order-history.dto';
import { UpdateOrderHistoryDto } from '../dto/update-order-history.dto';
import { Order, OrderHistory } from 'common/entities';
@Injectable()
export class OrderHistoryService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderHistory)
    private readonly orderHistoryRepo: Repository<OrderHistory>
  ) {}

  async create(createOrderHistoryDto: CreateOrderHistoryDto) {
    const orderHistory = this.orderHistoryRepo.create(createOrderHistoryDto);
    return this.orderHistoryRepo.save(orderHistory);
  }

  async findAll() {
    return await this.orderHistoryRepo.find();
  }

  async findOne(conditions: FindConditions<OrderHistory>) {
    let orderHistory: OrderHistory;

    if (conditions?.id)
      orderHistory = await this.orderHistoryRepo.findOne(String(conditions.id));
    else orderHistory = await this.orderHistoryRepo.findOne(conditions);

    if (!orderHistory) throw new NotFoundException(`Order not found`);

    const order = await this.orderRepo.findOne({
      id: orderHistory.orderId,
    });

    return { ...orderHistory, order };
  }

  async update(id: string, updateOrderHistoryDto: UpdateOrderHistoryDto) {
    const orderHistory = await this.orderHistoryRepo.findOne(id);

    if (!orderHistory)
      throw new NotFoundException(`OrderHistory with id ${id} not found`);

    Object.assign(orderHistory, updateOrderHistoryDto);

    return await this.orderHistoryRepo.save(orderHistory);
  }

  async remove(id: string) {
    const orderHistory = await this.orderHistoryRepo.findOne(id);

    if (!orderHistory)
      throw new NotFoundException(`OrderHistory with id ${id} not found`);

    return await this.orderHistoryRepo.remove(orderHistory);
  }
}
