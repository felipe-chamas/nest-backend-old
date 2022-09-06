import { Module } from '@nestjs/common'
import { RouterModule } from 'nest-router'

import { AppController } from '@controllers/app.controller'
import { routes } from '@routes'

import { AuthModule } from './auth.module'
import { GlobalConfigModule } from './config.module'
import { MongoDbProvider } from './mongo.module'
import { NftCollectionModule } from './nft-collection.module'
import { NftModule } from './nft.module'
import { UserModule } from './user.module'
import { WalletModule } from './wallet.module'

@Module({
  imports: [
    GlobalConfigModule,
    RouterModule.forRoutes(routes),
    MongoDbProvider,
    WalletModule,
    UserModule,
    NftModule,
    NftCollectionModule,
    AuthModule
  ],
  controllers: [AppController]
})
export class AppModule {}
