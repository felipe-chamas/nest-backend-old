import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { logger } from 'common/providers/logger';
import { getConnectionOptions } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () =>
        Object.assign(await getConnectionOptions(), {
          useNewUrlParser: true,
          useCreateIndex: true,
          useUnifiedTopology: true,
          autoLoadEntities: true,
        }),
    }),
  ],
})
export class MongoDbProvider {
  onModuleInit() {
    logger.info('connected to mongodb');
  }
}
