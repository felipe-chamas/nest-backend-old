import { Injectable } from '@nestjs/common';
import { logger } from 'common/providers';
import { ChainId } from 'common/types';
import { ethers } from 'ethers';
import { SQSMessage } from 'sqs-consumer';
import tokenClaimed from './listeners/token-claimed';
import transfer from './listeners/transfer';

type EventType = 'TokenClaimed' | 'Transfer';

export interface ParsiqEvent {
  tx: string;
  event: EventType;
  contractAddress: string;
  chainId: ChainId;
}

const TokenClaimedABI = [
  'event TokenClaimed(address indexed account, bytes32 indexed merkleRoot, uint256 tokenId)',
];
const TransferABI = [
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

export function parseLogs(logs: ethers.providers.Log[]): Array<{
  event: ethers.utils.LogDescription;
  address: string;
}> {
  const iTokenClaimed = new ethers.utils.Interface(TokenClaimedABI);
  const iTransfer = new ethers.utils.Interface(TransferABI);
  return logs
    .map((log) => {
      let event: ethers.utils.LogDescription;
      try {
        event = iTokenClaimed.parseLog(log);
        // eslint-disable-next-line no-empty
      } catch (err) {}
      if (!event) {
        try {
          event = iTransfer.parseLog(log);
          // eslint-disable-next-line no-empty
        } catch (err) {}
      }
      return {
        event,
        address: log.address,
      };
    })
    .filter((x) => x.event);
}

const handlers: Record<EventType, (event: ParsiqEvent) => Promise<void>> = {
  TokenClaimed: tokenClaimed,
  Transfer: transfer,
};

@Injectable()
export class QueueService {
  async handleMessage(message: SQSMessage) {
    logger.warn(message);
    const parsiqEvent: ParsiqEvent = JSON.parse(message.Body);
    const handler = handlers[parsiqEvent.event];
    if (handler) {
      await handler(parsiqEvent);
    } else {
      throw new Error(`Invalid event ${JSON.stringify(parsiqEvent)}`);
    }
  }
}
