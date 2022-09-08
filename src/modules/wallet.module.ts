import { Module } from '@nestjs/common'

import { WalletController } from '@controllers/wallet.controller'
import { WalletService } from '@services/wallet.service'

import { UserModule } from './user.module'

@Module({
  controllers: [WalletController],
  imports: [UserModule],
  exports: [WalletService],
  providers: [WalletService]
})
export class WalletModule {}
