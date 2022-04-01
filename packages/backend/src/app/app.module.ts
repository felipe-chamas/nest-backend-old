import { Module } from '@nestjs/common';
import { GloablConfigModule } from 'common/providers/config/config.module';
import { MongoDbProvider } from '../common/providers/databse/mongo/mongo.module';

import { UserModule } from '../models/user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [GloablConfigModule, MongoDbProvider, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
