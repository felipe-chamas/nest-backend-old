import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { NftCollectionDto } from '@common/dto/entities/nft-collection.dto'
import { NftDto } from '@common/dto/entities/nft.dto'
import { NftController } from '@controllers/nft.controller'
import { WalletModule } from '@modules/wallet.module'
import { NftCollectionService } from '@services/nft-collection.service'
import { NftService } from '@services/nft.service'

@Module({
  controllers: [NftController],
  providers: [NftService, NftCollectionService],
  imports: [TypeOrmModule.forFeature([NftDto, NftCollectionDto]), WalletModule],
  exports: [NftService]
})
export class NftModule {}
