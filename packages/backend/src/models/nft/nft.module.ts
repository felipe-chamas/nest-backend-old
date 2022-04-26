import { Module } from '@nestjs/common';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nft } from './entities/nft.entity';

@Module({
  controllers: [NftController],
  providers: [NftService],
  imports: [TypeOrmModule.forFeature([Nft])],
})
export class NftModule {}
