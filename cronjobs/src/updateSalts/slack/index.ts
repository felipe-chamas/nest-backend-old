import axios from 'axios'

import getEnv from '../constants/env'

export default async function slackAlert(message: string) {
  const slackUrl = getEnv('SLACK_URL')
  const stage = getEnv('STAGE')

  if (stage !== 'local') {
    await axios.post(slackUrl, {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Update pin container*: \n - *message:* ${message}`
          }
        }
      ]
    })
  }
}
