import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ParsiqController } from './parsiq.controller';
import { ParsiqProcessor } from './parsiq.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'parsiq',
    }),
  ],
  controllers: [ParsiqController],
  providers: [ParsiqProcessor],
})
export class ParsiqModule {}
