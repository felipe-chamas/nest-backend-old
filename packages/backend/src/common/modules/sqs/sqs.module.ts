import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ConfigService } from 'aws-sdk';
import { logger } from 'common/providers/logger';

import { SqsProvider } from './sqs.provider';
import { SqsService } from './sqs.service';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [SqsService, ConfigService, SqsProvider],
  exports: [SqsService],
})
export class SqsModule {
  constructor(private readonly sqsProvider: SqsProvider) {}
  onModuleInit() {
    this.sqsProvider.start();
    logger.info('SqsModule started');
  }
}
