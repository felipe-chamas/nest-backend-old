import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { NftCollection } from '../../common/entities/nft-collection.entity';
import { Nft } from 'common/entities/nft.entity';

import { NftCollectionController } from './controllers/nft-collection.controller';
import { NftCollectionService } from './services/nft-collection.service';

@Module({
  controllers: [NftCollectionController],
  providers: [NftCollectionService],
  imports: [TypeOrmModule.forFeature([NftCollection, Nft])],
  exports: [NftCollectionService],
})
export class NftCollectionModule {}
