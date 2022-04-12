import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { logger } from 'common/providers/logger';
import { NftCollection } from 'models/nft-collection/entities/nft-collection.entity';
import { Nft } from 'models/nft/entities/nft.entity';
import { User } from 'models/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mongodb',
        url: config.get<string>('database.url'),
        entities: [User, Nft, NftCollection],
        useNewUrlParser: true,
        logging: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      }),
    }),
  ],
})
export class MongoDbProvider {
  onModuleInit() {
    logger.info('connected to mongodb');
  }
}
