import * as winston from 'winston'
const { format, createLogger } = winston
const { combine, timestamp, json, colorize, align, printf, logstash, prettyPrint, errors } = format

const stage = process.env.STAGE

export const loggerOptions: winston.LoggerOptions =
  stage === 'local'
    ? {
        level: 'info',
        transports: [
          new winston.transports.Console({
            format: combine(
              colorize({ all: true }),
              errors({ stack: true }),
              timestamp(),
              align(),
              prettyPrint(),
              printf(
                ({ level, message, timestamp, stack }) =>
                  `[${timestamp}]  [${level}]:  ${message}  ${level == 'error' ? stack : ''}`
              )
            )
          })
        ]
      }
    : {
        level: 'info',
        format: combine(errors({ stack: true }), timestamp(), json()),
        transports: [
          new winston.transports.File({
            filename: `logs/error.log`,
            level: 'error'
          }),
          new winston.transports.File({
            filename: `logs/combined.log`
          }),
          new winston.transports.Console({
            format: logstash()
          })
        ]
      }

export const logger = createLogger(loggerOptions)
