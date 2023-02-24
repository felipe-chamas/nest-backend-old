import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { NftUnboxingDto, NftUnboxingSchema } from '@common/schemas/nft-unboxing.schema'
import { NftUnboxingService } from '@services/utils/nftUnboxing.services'
import { VenlyService } from '@services/utils/venly.service'

import { SlackModule } from './slack/slack.module'
import { HttpVenlyApiModule } from './venly/api.module'
import { HttpVenlyAuthModule } from './venly/auth.module'

@Module({
  imports: [
    HttpVenlyApiModule,
    HttpVenlyAuthModule,
    MongooseModule.forFeature([{ name: NftUnboxingDto.name, schema: NftUnboxingSchema }]),
    SlackModule
  ],
  providers: [VenlyService, NftUnboxingService],
  exports: [VenlyService]
})
export class VenlyModule {}
