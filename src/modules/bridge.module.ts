import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { BridgeDto, BridgeSchema } from '@common/schemas/bridge.schema'
import { BridgeService } from '@services/bridge.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: BridgeDto.name,
        schema: BridgeSchema
      }
    ])
  ],
  exports: [BridgeService],
  providers: [BridgeService]
})
export class BridgeModule {}
