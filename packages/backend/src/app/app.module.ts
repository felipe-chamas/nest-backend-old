import { Module } from '@nestjs/common';
import { QueueModule } from 'common/modules';
import { GlobalConfigModule, MongoDbProvider } from 'common/providers';
import {
  NftCollectionModule,
  NftModule,
  OrderHistoryModule,
  OrderModule,
  UserModule,
  ChainModule,
  NftClaimModule,
} from 'models';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { AuthModule } from 'auth';
import { WalletModule } from 'models/wallet/wallet.module';

@Module({
  imports: [
    GlobalConfigModule,
    MongoDbProvider,
    QueueModule.register(),
    WalletModule,
    UserModule,
    NftModule,
    NftCollectionModule,
    ChainModule,
    OrderModule,
    OrderHistoryModule,
    NftClaimModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
