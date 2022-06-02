import { Module } from '@nestjs/common';
import { QueueModule } from 'common/modules';
import {
  GlobalConfigModule,
  logger,
  MongoDbProvider,
  RedisClient,
} from 'common/providers';
import {
  NftCollectionModule,
  NftModule,
  OrderHistoryModule,
  OrderModule,
  UserModule,
} from 'models';
import { NftClaimModule } from 'models/nft-claim/nft-claim.module';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { AuthModule } from 'auth';

@Module({
  imports: [
    GlobalConfigModule,
    MongoDbProvider,
    QueueModule.register(),
    UserModule,
    NftModule,
    NftCollectionModule,
    OrderModule,
    OrderHistoryModule,
    NftClaimModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  public async onModuleInit() {
    RedisClient.on('ready', () => {
      logger.info('Redis client is ready');
    });
    RedisClient.on('error', (err) => logger.error(`Redis error: ${err}`));
    await RedisClient.connect();
  }
}
