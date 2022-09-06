import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import config from '@common/config'
import { logger } from '@common/providers/logger'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true
    })
  ]
})
export class GlobalConfigModule {
  onModuleInit() {
    logger.info('config loaded')
  }
}
