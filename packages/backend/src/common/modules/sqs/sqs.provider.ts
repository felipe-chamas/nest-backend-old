import { SQS } from 'aws-sdk';
import * as https from 'https';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, ConsumerOptions } from 'sqs-consumer';
import { SqsService } from './sqs.service';
import { logger } from 'common/providers/logger';

@Injectable()
export class SqsProvider {
  sqsOptions: ConsumerOptions = {
    queueUrl: this.config.get<string>('sqs.queueUrl'),
    sqs: new SQS({
      httpOptions: {
        agent: new https.Agent({
          keepAlive: true,
        }),
      },
    }),
    handleMessage: this.sqsService.handleMessge,
  };

  sqsConsumer = Consumer.create(this.sqsOptions);

  constructor(
    private readonly sqsService: SqsService,
    private readonly config: ConfigService
  ) {}

  start() {
    this.sqsConsumer.on('error', (err, msg) => {
      logger.error({ err, msg });
    });
    this.sqsConsumer.on('message_received', (message) => {
      logger.info({
        status: 'message_received',
        message,
      });
    });
    this.sqsConsumer.on('message_processed', (message) => {
      logger.info({
        status: 'message_processed and removed from the queue',
        message,
      });
    });
    this.sqsConsumer.on('empty', () => {
      logger.info('message queue is empty');
    });
    this.sqsConsumer.on('response_processed', () => {
      logger.info('response_processed');
    });
    this.sqsConsumer.on('stopped', () => {
      logger.info('sqs consumer stopped');
    });
    this.sqsConsumer.on('timeout_error', (err, msg) => {
      logger.error({
        status: 'timeout_error',
        err,
        msg,
      });
    });
    this.sqsConsumer.on('processing_error', (err, msg) => {
      logger.error({ err, msg });
    });
    this.sqsConsumer.start();
    logger.info('Sqs consumer started');
  }
}
