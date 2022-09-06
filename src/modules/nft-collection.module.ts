import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { NftCollectionDto } from '@common/dto/entities/nft-collection.dto'
import { NftDto } from '@common/dto/entities/nft.dto'
import { NftCollectionController } from '@controllers/nft-collection.controller'
import { NftCollectionService } from '@services/nft-collection.service'

@Module({
  controllers: [NftCollectionController],
  providers: [NftCollectionService],
  imports: [TypeOrmModule.forFeature([NftCollectionDto, NftDto])],
  exports: [NftCollectionService]
})
export class NftCollectionModule {}
