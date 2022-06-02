import { InjectQueue } from '@nestjs/bull';
import { Body, Controller, Post } from '@nestjs/common';
import { Queue } from 'bull';
import { AddToQueueDto } from './add-to-queue.dto';

@Controller('queue')
export class ParsiqController {
  constructor(@InjectQueue('parsiq') private readonly parsiqQueue: Queue) {}

  @Post()
  addToQueue(@Body() body: AddToQueueDto) {
    return this.parsiqQueue.add({
      Body: JSON.stringify(body),
    });
  }
}
