import * as winston from 'winston';
const { format, createLogger } = winston;
const { combine, timestamp, json, colorize, align, printf } = format;

const env = process.env.NODE_ENV || 'development';

const loggerOptions: winston.LoggerOptions = {
  level: 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss A',
    }),
    json()
  ),
  transports: [
    new winston.transports.File({
      filename: `logs/error.log`,
      level: 'error',
    }),
    new winston.transports.File({
      filename: `logs/combined.log`,
    }),
  ],
};

export const logger = createLogger(loggerOptions);

if (env === 'development') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
      ),
    })
  );
}
