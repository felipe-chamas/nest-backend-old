import { Injectable } from '@nestjs/common';
import { SQSMessage } from 'sqs-consumer';
// import tokenClaimed from './listeners/token-claimed';
import transfer from './listeners/transfer';

type EventType = 'TokenClaimed' | 'Transfer';

export interface ParsiqEvent {
  tx: string;
  event: EventType;
  contractAddress: string;
}

// const handlers: Record<EventType, (event: ParsiqEvent) => Promise<void>> = {
//   // TokenClaimed: tokenClaimed,
//   Transfer: transfer,
// };

@Injectable()
export class SqsService {
  async handleMessge(message: SQSMessage) {
    // const parsiqEvent: ParsiqEvent = JSON.parse(message.Body);
    // const handler = handlers[parsiqEvent.event];
    // if (handler) {
    //   await handler(parsiqEvent);
    // } else {
    //   throw new Error(`Invalid event ${JSON.stringify(parsiqEvent)}`);
    // }
  }
}
