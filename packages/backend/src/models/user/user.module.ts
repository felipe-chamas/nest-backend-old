import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongoEntityManager, MongoRepository } from 'typeorm';

import { GlobalConfigModule } from 'common/providers';

import { UserController } from './controllers';

import { User, Nft } from 'common/entities';

import { UserService } from './services';

@Module({
  controllers: [UserController],
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [GlobalConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get('throttler.ttl'),
        limit: configService.get('throttler.limit'),
        max: configService.get('throttler.max'),
      }),
    }),
    TypeOrmModule.forFeature([User, Nft]),
    MongoEntityManager,
  ],
  exports: [UserService, TypeOrmModule],
  providers: [UserService, MongoRepository],
})
export class UserModule {}
