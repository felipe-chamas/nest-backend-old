import { Module } from '@nestjs/common';
import { GloablConfigModule } from 'common/providers/config/config.module';
import { SqsModule } from 'common/modules/sqs/sqs.module';
import { NftCollectionModule } from 'models/nft-collection/nft-collection.module';
import { NftModule } from 'models/nft/nft.module';
import { NftClaimModule } from 'models/nft-claim/nft-claim.module';
import { MongoDbProvider } from '../common/providers/databse/mongo/mongo.module';

import { UserModule } from '../models/user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    GloablConfigModule,
    MongoDbProvider,
    UserModule,
    NftModule,
    NftCollectionModule,
    NftClaimModule,
    SqsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
