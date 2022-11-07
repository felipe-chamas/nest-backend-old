import { Module } from '@nestjs/common'

import { NftGameController } from '@controllers/nft-game.controller'

import { UserModule } from './user.module'
import { EvmModule } from './utils/evm.module'
import { VenlyModule } from './utils/venly.module'

@Module({
  controllers: [NftGameController],
  imports: [VenlyModule, UserModule, EvmModule]
})
export class NftGameModule {}
