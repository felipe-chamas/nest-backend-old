import { SlackService } from '@services/utils/slack/slack.service'

export const slackServiceMock: Partial<SlackService> = {
  triggerAlert: jest.fn()
}
