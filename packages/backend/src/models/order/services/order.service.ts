import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { Order } from '../../../common/entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const order = this.orderRepo.create(createOrderDto);
    return await this.orderRepo.save(order);
  }

  async findAll() {
    return await this.orderRepo.find();
  }

  async findOne(id: string) {
    const order = await this.orderRepo.findOne(id);

    if (!order) throw new NotFoundException(`Order with id ${id} not found`);

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderRepo.findOne(id);

    if (!order) throw new NotFoundException(`Order with id ${id} not found`);

    Object.assign(order, updateOrderDto);

    return await this.orderRepo.save(order);
  }

  async remove(id: string) {
    const order = await this.orderRepo.findOne(id);

    if (!order) throw new NotFoundException(`Order with id ${id} not found`);

    return await this.orderRepo.remove(order);
  }
}
