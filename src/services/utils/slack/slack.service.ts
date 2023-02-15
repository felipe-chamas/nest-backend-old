import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

@Injectable()
export class SlackService {
  constructor(private readonly config: ConfigService) {}

  async triggerAlert(message: string) {
    const slackUrl = this.config.get('slack.slackUrl')

    await axios.post(slackUrl, {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message
          }
        }
      ]
    })
  }
}
