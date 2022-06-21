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

import { OrderService } from '../services/order.service';

import { CreateOrderDto } from '../dto/create-order.dto';
import {
  UpdateOrderDto,
  UpdateOrderDtoResponse,
} from '../dto/update-order.dto';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { FindOneOrderDto, OrderDto } from '../dto/order.dto';
import { Roles } from 'common/decorators/roles.decorators';
import { Role } from 'common/enums/role.enum';
import { GetPagination, Pagination } from 'common/decorators';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles(Role.MARKETPLACE_ADMIN)
  @Post()
  @ApiOperation({ description: 'Creates an Order' })
  @ApiOkResponse({ type: OrderDto })
  @ApiBody({ type: CreateOrderDto })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ description: 'Returns a list of orders' })
  @ApiOkResponse({ type: [OrderDto], schema: { type: 'array' } })
  findAll(@Query() query: Request, @GetPagination() pagination: Pagination) {
    return this.orderService.findAll({ ...query, ...pagination });
  }

  @Get(':id')
  @ApiOperation({ description: 'Returns an order with given `id`' })
  @ApiOkResponse({ type: FindOneOrderDto })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne({ id });
  }

  @Roles(Role.MARKETPLACE_ADMIN)
  @Patch(':id')
  @ApiOperation({ description: 'Updates an order with given `id`' })
  @ApiOkResponse({ type: UpdateOrderDtoResponse })
  @ApiBody({ type: UpdateOrderDto })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Roles(Role.MARKETPLACE_ADMIN)
  @Delete(':id')
  @ApiOperation({ description: 'Deletes an order with given `id`' })
  @ApiOkResponse({ type: OrderDto })
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
