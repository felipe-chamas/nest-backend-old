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
      console.error(err, msg);
    });
    this.sqsConsumer.on('message_received', (message) => {
      console.log({
        status: 'message_received',
        message,
      });
    });
    this.sqsConsumer.on('message_processed', (message) => {
      console.log({
        status: 'message_processed and removed from the queue',
        message,
      });
    });
    this.sqsConsumer.on('empty', () => {
      console.log({
        status: 'messge queue is empty',
      });
    });
    this.sqsConsumer.on('response_processed', () => {
      console.log('response_processed');
    });
    this.sqsConsumer.on('stopped', () => {
      console.log('stopped');
    });
    this.sqsConsumer.on('timeout_error', (err, msg) => {
      console.error(err, msg);
    });
    this.sqsConsumer.on('processing_error', (err, msg) => {
      console.error(err, msg);
    });
    this.sqsConsumer.start();
    logger.info('Sqs consumer started');
  }
}
