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
import {
  UpdateOrderHistoryDto,
  UpdateOrderHistoryResponseDto,
} from '../dto/update-order-history.dto';
import { GetPagination, Pagination } from 'common/decorators';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  FindOneOrderHistoryDto,
  OrderHistoryDto,
} from '../dto/order-history.dto';
import { Roles } from 'common/decorators/roles.decorators';
import { Role } from 'common/enums/role.enum';

@Controller('order-history')
export class OrderHistoryController {
  constructor(private readonly orderHistoryService: OrderHistoryService) {}

  @Roles(Role.MARKETPLACE_ADMIN)
  @Post()
  @ApiOperation({ description: 'Creates an order history' })
  @ApiOkResponse({ type: OrderHistoryDto })
  @ApiBody({ type: CreateOrderHistoryDto })
  create(@Body() createOrderHistoryDto: CreateOrderHistoryDto) {
    return this.orderHistoryService.create(createOrderHistoryDto);
  }

  @Get()
  @ApiOperation({ description: 'Returns a list of order histories' })
  @ApiOkResponse({ type: [OrderHistoryDto], schema: { type: 'array' } })
  findAll(@Query() query, @GetPagination() pagination: Pagination) {
    return this.orderHistoryService.findAll({ ...query, ...pagination });
  }

  @Get(':id')
  @ApiOperation({ description: 'Returns an order history with given `id`' })
  @ApiOkResponse({ type: FindOneOrderHistoryDto })
  findOne(@Param('id') id: string) {
    return this.orderHistoryService.findById(id);
  }

  @Roles(Role.MARKETPLACE_ADMIN)
  @Patch(':id')
  @ApiOperation({ description: 'Updates an order history with given `id`' })
  @ApiOkResponse({ type: UpdateOrderHistoryResponseDto })
  @ApiBody({ type: UpdateOrderHistoryDto })
  update(
    @Param('id') id: string,
    @Body() updateOrderHistoryDto: UpdateOrderHistoryDto,
  ) {
    return this.orderHistoryService.update(id, updateOrderHistoryDto);
  }

  @Roles(Role.MARKETPLACE_ADMIN)
  @Delete(':id')
  @ApiOperation({ description: 'Deletes an order history with given `id`' })
  @ApiOkResponse({ type: OrderHistoryDto })
  remove(@Param('id') id: string) {
    return this.orderHistoryService.remove(id);
  }
}
