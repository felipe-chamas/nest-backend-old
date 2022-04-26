import { Module } from '@nestjs/common';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nft } from './entities/nft.entity';
import { NftCollectionService } from 'models/nft-collection/nft-collection.service';
import { NftCollection } from 'models/nft-collection/entities/nft-collection.entity';

@Module({
  controllers: [NftController],
  providers: [NftCollectionService, NftService],
  imports: [
    TypeOrmModule.forFeature([NftCollection]),
    TypeOrmModule.forFeature([Nft]),
  ],
})
export class NftModule {}
