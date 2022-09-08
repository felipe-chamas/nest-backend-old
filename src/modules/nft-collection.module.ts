import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { NftCollectionDto, NftCollectionSchema } from '@common/schemas/nft-collection.schema'
import { NftCollectionController } from '@controllers/nft-collection.controller'
import { NftCollectionService } from '@services/nft-collection.service'

@Module({
  controllers: [NftCollectionController],
  providers: [NftCollectionService],
  imports: [
    MongooseModule.forFeature([{ name: NftCollectionDto.name, schema: NftCollectionSchema }])
  ],
  exports: [NftCollectionService]
})
export class NftCollectionModule {}
