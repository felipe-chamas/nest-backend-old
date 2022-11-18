import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import axios from 'axios'
import { Request, Response } from 'express'

import config from '@common/config'

import { logger } from '../providers/logger'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    const { method, url } = request
    const status = exception.getStatus()
    const validationError = exception.getResponse()

    const {
      slack: { slackUrl },
      stage
    } = config()
    if (status === 500 && stage === 'production') {
      await axios.post(slackUrl, {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Falco Bakend Alert*: \n - *path:* ${request.url}\n - *status code:* ${status} \n - *name:* ${exception.name}\n - *message:* ${exception.message}`
            }
          }
        ]
      })
    }

    logger.log({
      level: 'error',
      message: `${method} ${url}: Response type: Error ${status}`,
      response: exception.message,
      errorInfo: {
        status,
        validationError,
        timestamp: new Date().toISOString(),
        path: url
      }
    })

    if (typeof validationError === 'object') {
      return response.status(status).json(validationError)
    }

    const errorResponse = {
      statusCode: status,
      error: exception.message,
      timestamp: new Date().toISOString(),
      path: url
    }

    response.status(status).json(errorResponse)
  }
}
