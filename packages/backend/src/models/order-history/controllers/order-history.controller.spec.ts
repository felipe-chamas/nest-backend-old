import { Test, TestingModule } from '@nestjs/testing';
import { OrderHistoryController } from './order-history.controller';
import { OrderHistoryService } from '../services/order-history.service';

describe('OrderHistoryController', () => {
  let controller: OrderHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderHistoryController],
      providers: [
        {
          provide: OrderHistoryService,
          useValue: OrderHistoryService.prototype,
        },
      ],
    }).compile();

    controller = module.get<OrderHistoryController>(OrderHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
