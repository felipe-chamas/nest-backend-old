import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongoEntityManager, MongoRepository } from 'typeorm';

import { GloablConfigModule } from 'common/providers';

import { UserController } from './controllers';
import { CurrentUserInterceptor } from './interceptors';

import { User, Nft } from 'common/entities';

import { AuthController, AuthService } from './auth';
import { UserService } from './services';

@Module({
  controllers: [UserController, AuthController],
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [GloablConfigModule],
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
  exports: [UserService, AuthService, TypeOrmModule],
  providers: [
    UserService,
    AuthService,
    MongoRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
})
export class UserModule {}
