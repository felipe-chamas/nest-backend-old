import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { SolanaService } from '@services/utils/solana.service'

import { HttpQuicknodeApiModule } from './quicknode/api.module'

@Module({
  imports: [HttpQuicknodeApiModule, HttpModule],
  providers: [SolanaService],
  exports: [SolanaService]
})
export class SolanaModule {}
