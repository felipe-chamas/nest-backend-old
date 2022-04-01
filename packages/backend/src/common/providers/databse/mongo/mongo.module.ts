import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'models/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mongodb',
        url: config.get<string>('database.url'),
        entities: [User],
        useNewUrlParser: true,
        logging: true,
        synchronize: config.get<string>('env') === 'development' ? true : false,
      }),
    }),
  ],
})
export class MongoDbProvider {}
