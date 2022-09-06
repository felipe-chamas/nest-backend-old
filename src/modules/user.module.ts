import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MongoEntityManager, MongoRepository } from 'typeorm'

import { NftDto } from '@common/dto/entities/nft.dto'
import { UserDto } from '@common/dto/entities/user.dto'
import { UserController } from '@controllers/user.controller'
import { UserService } from '@services/user.service'

import { GlobalConfigModule } from './config.module'

@Module({
  controllers: [UserController],
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [GlobalConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get('throttler.ttl'),
        limit: configService.get('throttler.limit'),
        max: configService.get('throttler.max')
      })
    }),
    TypeOrmModule.forFeature([UserDto, NftDto]),
    MongoEntityManager
  ],
  exports: [UserService, TypeOrmModule],
  providers: [UserService, MongoRepository]
})
export class UserModule {}
