import { Module } from '@nestjs/common';
import { ChainService } from './services/chain.service';
import { ChainController } from './controllers/chain.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chain } from '../../common/entities/chain.entity';

@Module({
  controllers: [ChainController],
  providers: [ChainService],
  imports: [TypeOrmModule.forFeature([Chain])],
  exports: [ChainService],
})
export class ChainModule {}
