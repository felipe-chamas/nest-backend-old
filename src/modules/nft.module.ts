import { Module } from '@nestjs/common'

import { NftController } from '@controllers/nft.controller'

import { NftCollectionModule } from './nft-collection.module'
import { EvmModule } from './utils/evm.module'
import { SolanaModule } from './utils/solana.module'

@Module({
  imports: [NftCollectionModule, EvmModule, SolanaModule],
  controllers: [NftController]
})
export class NftModule {}
