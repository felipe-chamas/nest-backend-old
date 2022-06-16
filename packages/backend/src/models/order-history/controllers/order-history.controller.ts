import { Request } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrderHistoryService } from '../services/order-history.service';
import { CreateOrderHistoryDto } from '../dto/create-order-history.dto';
import { UpdateOrderHistoryDto } from '../dto/update-order-history.dto';
import { GetPagination, Pagination } from 'common/decorators';
import { Roles } from 'common/decorators/roles.decorators';
import { Role } from 'common/enums/role.enum';

@Controller('order-history')
export class OrderHistoryController {
  constructor(private readonly orderHistoryService: OrderHistoryService) {}

  @Roles(Role.MARKETPLACE_ADMIN)
  @Post()
  create(@Body() createOrderHistoryDto: CreateOrderHistoryDto) {
    return this.orderHistoryService.create(createOrderHistoryDto);
  }

  @Get()
  findAll(@Query() query: Request, @GetPagination() pagination: Pagination) {
    return this.orderHistoryService.findAll({ ...query, ...pagination });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderHistoryService.findOne({ id });
  }

  @Roles(Role.MARKETPLACE_ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderHistoryDto: UpdateOrderHistoryDto,
  ) {
    return this.orderHistoryService.update(id, updateOrderHistoryDto);
  }

  @Roles(Role.MARKETPLACE_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderHistoryService.remove(id);
  }
}
