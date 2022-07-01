import { BullModule } from '@nestjs/bull';
import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ParsiqModule } from './bull/parsiq.module';

import { QueueService } from './queue.service';
import { SqsModule } from './sqs/sqs.module';

type Imports = Array<Type<unknown> | DynamicModule>;

@Global()
@Module({})
export class QueueModule {
  static register(): DynamicModule {
    const imports: Imports = [DiscoveryModule];

    const stage = process.env.STAGE;
    if (stage === 'local') {
      imports.push(BullModule.forRoot({}));
      imports.push(ParsiqModule);
    } else {
      imports.push(SqsModule);
    }

    return {
      module: QueueModule,
      imports: imports,
      providers: [QueueService],
      exports: [QueueService],
    };
  }
}
