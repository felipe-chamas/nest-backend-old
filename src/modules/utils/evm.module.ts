import { Module } from '@nestjs/common'

import { EvmService } from '@services/utils/evm.service'

import { HttpMoralisApiModule } from './moralis/api.module'

@Module({
  imports: [HttpMoralisApiModule],
  providers: [EvmService],
  exports: [EvmService]
})
export class EvmModule {}
