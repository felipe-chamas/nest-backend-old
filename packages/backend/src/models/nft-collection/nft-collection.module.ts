import { Module } from '@nestjs/common';
import { NftCollectionService } from './nft-collection.service';
import { NftCollectionController } from './nft-collection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftCollection } from './entities/nft-collection.entity';
import { Nft } from 'models/nft/entities/nft.entity';

@Module({
  controllers: [NftCollectionController],
  providers: [NftCollectionService],
  imports: [TypeOrmModule.forFeature([NftCollection, Nft])],
})
export class NftCollectionModule {}
