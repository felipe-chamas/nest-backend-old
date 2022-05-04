import { Module } from '@nestjs/common';
import { OrderHistoryService } from './services/order-history.service';
import { OrderHistoryController } from './controllers/order-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderHistory } from '../../common/entities/order-history.entity';

@Module({
  controllers: [OrderHistoryController],
  providers: [OrderHistoryService],
  exports: [OrderHistoryService],
  imports: [TypeOrmModule.forFeature([OrderHistory])],
})
export class OrderHistoryModule {}
