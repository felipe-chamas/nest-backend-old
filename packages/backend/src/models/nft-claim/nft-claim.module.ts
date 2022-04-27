import { Module } from '@nestjs/common';
import { NftClaimService } from './nft-claim.service';
import { NftClaimController } from './nft-claim.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftClaim } from './entities/nft-claim.entity';

@Module({
  controllers: [NftClaimController],
  providers: [NftClaimService],
  imports: [TypeOrmModule.forFeature([NftClaim])],
})
export class NftClaimModule {}
