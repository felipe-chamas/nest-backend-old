import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from '../../config';
import { logger } from '../logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
  ],
})
export class GlobalConfigModule {
  onModuleInit() {
    logger.info('config loaded');
  }
}
