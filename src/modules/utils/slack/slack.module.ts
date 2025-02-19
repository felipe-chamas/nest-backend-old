import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { SlackService } from '@services/utils/slack/slack.service'

@Module({
  imports: [ConfigModule],
  providers: [SlackService],
  exports: [SlackService]
})
export class SlackModule {}
