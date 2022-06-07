import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { logger } from 'common/providers';
import { SQSMessage } from 'sqs-consumer';
import { QueueService } from '../queue.service';

interface JobData {
  Body?: string;
}

@Processor('parsiq')
export class ParsiqProcessor {
  constructor(private queueService: QueueService) {
    logger.info('Queue consumer started');
  }

  @Process()
  handleJob(job: Job<JobData>) {
    this.queueService.handleMessage(job.data as SQSMessage);
  }
}
