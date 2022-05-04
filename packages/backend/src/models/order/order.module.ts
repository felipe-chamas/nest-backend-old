import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../common/entities/order.entity';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
  imports: [TypeOrmModule.forFeature([Order])],
})
export class OrderModule {}
