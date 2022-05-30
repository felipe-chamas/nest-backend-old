import { Test, TestingModule } from '@nestjs/testing';
import { Order, OrderHistory } from 'common/entities';
import { OrderHistoryService } from './order-history.service';

describe('OrderHistoryService', () => {
  let service: OrderHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: OrderHistoryService,
          useValue: OrderHistoryService.prototype,
        },
        {
          provide: Order,
          useValue: Order.prototype,
        },
        {
          provide: OrderHistory,
          useValue: OrderHistory.prototype,
        },
      ],
    }).compile();

    service = module.get<OrderHistoryService>(OrderHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
