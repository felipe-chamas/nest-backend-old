import { ConfigService } from '@nestjs/config';
import { ConsumerOptions } from 'sqs-consumer';
import { SQS } from 'aws-sdk';
import * as https from 'https';

const config = new ConfigService();

export const sqsOptions: ConsumerOptions = {
  queueUrl: config.get<string>('sqs.queueUrl'),
  sqs: new SQS({
    httpOptions: {
      agent: new https.Agent({
        keepAlive: true,
      }),
    },
  }),
};
