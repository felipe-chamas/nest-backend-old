import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ThrottlerModule } from '@nestjs/throttler'

import { UserDto, UserSchema } from '@common/schemas/user.schema'
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
    MongooseModule.forFeature([{ name: UserDto.name, schema: UserSchema }])
  ],
  exports: [UserService],
  providers: [UserService]
})
export class UserModule {}
