import { Module } from '@nestjs/common';
import { UserModule } from 'models/user/user.module';
import { MongoRepository } from 'typeorm';

import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  controllers: [WalletController],
  imports: [UserModule],
  exports: [WalletService],
  providers: [WalletService, MongoRepository],
})
export class WalletModule {}
