import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from '../../config/index';
import { logger } from '../logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
  ],
})
export class GloablConfigModule {
  onModuleInit() {
    logger.info('config loaded');
  }
}
