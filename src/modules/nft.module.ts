import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { NftDto, NftSchema } from '@common/schemas/nft.schema'
import { NftController } from '@controllers/nft.controller'
import { WalletModule } from '@modules/wallet.module'
import { NftService } from '@services/nft.service'

import { NftCollectionModule } from './nft-collection.module'

@Module({
  controllers: [NftController],
  providers: [NftService],
  imports: [
    NftCollectionModule,
    MongooseModule.forFeature([{ name: NftDto.name, schema: NftSchema }]),
    WalletModule
  ],
  exports: [NftService]
})
export class NftModule {}
