import { Module } from '@nestjs/common'
import { RouterModule } from 'nest-router'

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
    AuthModule
  ],
  controllers: [AppController]
})
export class AppModule {}
