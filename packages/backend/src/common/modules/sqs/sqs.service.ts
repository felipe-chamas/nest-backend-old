import { Injectable } from '@nestjs/common';
import { SQSMessage } from 'sqs-consumer';

@Injectable()
export class SqsService {
  async handleMessge(message: SQSMessage) {
    console.log(message.MessageAttributes);
    console.log(message);
  }
}
