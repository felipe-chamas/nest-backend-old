import { Module } from '@nestjs/common'

import { NftGameController } from '@controllers/nft-game.controller'

import { UserModule } from './user.module'
import { EvmModule } from './utils/evm.module'
import { VenlyModule } from './utils/venly.module'
import { PinModule } from './utils/venly/pin.module'

@Module({
  controllers: [NftGameController],
  imports: [VenlyModule, UserModule, EvmModule, PinModule]
})
export class NftGameModule {}
