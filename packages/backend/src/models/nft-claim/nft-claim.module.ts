import { Module } from '@nestjs/common';
import { NftClaimController } from './controllers/nft-claim.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftClaim } from '../../common/entities/nft-claim.entity';
import { NftClaimService } from './services/nft-claim.service';

@Module({
  controllers: [NftClaimController],
  providers: [NftClaimService],
  imports: [TypeOrmModule.forFeature([NftClaim])],
})
export class NftClaimModule {}
