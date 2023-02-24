import { Module } from '@nestjs/common'

import { NftController } from '@controllers/nft.controller'

import { BridgeModule } from './bridge.module'
import { NftCollectionModule } from './nft-collection.module'
import { UserModule } from './user.module'
import { EvmModule } from './utils/evm.module'
import { SlackModule } from './utils/slack/slack.module'
import { SolanaModule } from './utils/solana.module'
import { VenlyModule } from './utils/venly.module'
import { PinModule } from './utils/venly/pin.module'

@Module({
  imports: [
    NftCollectionModule,
    UserModule,
    BridgeModule,
    EvmModule,
    SolanaModule,
    VenlyModule,
    PinModule,
    SlackModule
  ],
  controllers: [NftController]
})
export class NftModule {}
