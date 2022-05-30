import { Test, TestingModule } from '@nestjs/testing';
import { Order, OrderHistory } from 'common/entities';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service = OrderService.prototype;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: OrderService,
          useValue: OrderService.prototype,
        },
        {
          provide: OrderHistory,
          useValue: OrderHistory.prototype,
        },
        {
          provide: Order,
          useValue: Order.prototype,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
