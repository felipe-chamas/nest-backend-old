import 'dotenv/config'
import { RedisModule } from '@liaoliaots/nestjs-redis'
import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { RouterModule } from 'nest-router'

import { config } from '@common/constants/redisConfig'
import { HttpExceptionFilter } from '@common/filters/http-exception.filter'
import { AppController } from '@controllers/app.controller'
import { routes } from '@routes'

import { AuthModule } from './auth.module'
import { GlobalConfigModule } from './config.module'
import { NftCollectionModule } from './nft-collection.module'
import { NftGameModule } from './nft-game.module'
import { NftModule } from './nft.module'
import { UserModule } from './user.module'
import { MongoDbProvider } from './utils/mongo.module'

@Module({
  imports: [
    GlobalConfigModule,
    RouterModule.forRoutes(routes),
    MongoDbProvider,
    NftGameModule,
    NftCollectionModule,
    NftModule,
    UserModule,
    AuthModule,
    RedisModule.forRoot({
      config
    })
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class AppModule {}
