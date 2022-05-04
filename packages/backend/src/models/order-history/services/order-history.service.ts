import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderHistoryDto } from '../dto/create-order-history.dto';
import { UpdateOrderHistoryDto } from '../dto/update-order-history.dto';
import { OrderHistory } from '../../../common/entities/order-history.entity';

@Injectable()
export class OrderHistoryService {
  constructor(
    @InjectRepository(OrderHistory)
    private readonly orderHistory: Repository<OrderHistory>
  ) {}

  async create(createOrderHistoryDto: CreateOrderHistoryDto) {
    const orderHistory = this.orderHistory.create(createOrderHistoryDto);
    return this.orderHistory.save(orderHistory);
  }

  async findAll() {
    return await this.orderHistory.find();
  }

  async findOne(id: string) {
    const orderHistory = await this.orderHistory.findOne(id);

    if (!orderHistory)
      throw new NotFoundException(`OrderHistory with id ${id} not found`);

    return orderHistory;
  }

  async update(id: string, updateOrderHistoryDto: UpdateOrderHistoryDto) {
    const orderHistory = await this.orderHistory.findOne(id);

    if (!orderHistory)
      throw new NotFoundException(`OrderHistory with id ${id} not found`);

    Object.assign(orderHistory, updateOrderHistoryDto);

    return await this.orderHistory.save(orderHistory);
  }

  async remove(id: string) {
    const orderHistory = await this.orderHistory.findOne(id);

    if (!orderHistory)
      throw new NotFoundException(`OrderHistory with id ${id} not found`);

    return await this.orderHistory.remove(orderHistory);
  }
}
