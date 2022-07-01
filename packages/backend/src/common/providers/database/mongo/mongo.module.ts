import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { logger } from 'common/providers/logger';
import { getConnectionOptions } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) =>
        Object.assign(await getConnectionOptions(), {
          useNewUrlParser: true,
          useCreateIndex: true,
          useUnifiedTopology: true,
          autoLoadEntities: true,
          synchronize:
            config.get<string>('stage') === 'development' ? true : false,
        }),
    }),
  ],
})
export class MongoDbProvider {
  onModuleInit() {
    logger.info('connected to mongodb');
  }
}
