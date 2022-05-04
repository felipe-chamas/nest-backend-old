import { Module } from '@nestjs/common';
import { NftService } from './services/nft.service';
import { NftController } from './controllers/nft.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nft } from '../../common/entities/nft.entity';
import { NftCollection, NftCollectionService } from 'models/nft-collection';

@Module({
  controllers: [NftController],
  providers: [NftService, NftCollectionService],
  imports: [TypeOrmModule.forFeature([Nft, NftCollection])],
  exports: [NftService],
})
export class NftModule {}
