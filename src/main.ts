import 'dotenv/config'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import compression from 'compression'
import ConnectRedis from 'connect-redis'
import cookieParser from 'cookie-parser'
import { Request, Response, NextFunction } from 'express'
import session from 'express-session'
import helmet from 'helmet'
import { WinstonModule } from 'nest-winston'
import { createClient } from 'redis'

import { HttpExceptionFilter } from '@common/filters/http-exception.filter'
import { AuthGuard, isSafeEqual } from '@common/guards/auth.guard'
import { LoggerInterceptor } from '@common/interceptors/logger.interceptor'
import { logger, loggerOptions } from '@common/providers/logger'
import { Swagger } from '@common/providers/swagger.provider'
import { AppModule } from '@modules/app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(loggerOptions)
  })

  app.enableCors({
    origin: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true
  })

  app.use(helmet())
  app.use(cookieParser())
  app.use(compression())

  const globalPrefix = 'api'
  app.setGlobalPrefix(globalPrefix)

  const config = app.get(ConfigService)

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.useGlobalInterceptors(new LoggerInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalGuards(new AuthGuard(new Reflector(), config))

  logger.info(config.get<string>('redis_url'))

  const RedisStore = ConnectRedis(session)
  const redisClient = createClient({
    url: config.get<string>('redis_url', 'redis://localhost:6379'),
    legacyMode: true
  })

  app.set('trust proxy', 1)

  app.use(
    session({
      secret: config.get<string>('session_secret'),
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({ client: redisClient }),
      cookie: {
        secure: config.get<string>('stage') !== 'local',
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: false,
        sameSite: config.get<string>('stage') === 'local' ? 'strict' : 'none'
      }
    })
  )

  app.use(['/docs-json'], (req: Request, res: Response, next: NextFunction) => {
    if (isSafeEqual(req.query.token as string, config.get<string>('docs.token'))) {
      next()
    } else {
      res.status(401).send('Unauthorized')
    }
  })

  Swagger.init(app)

  redisClient.on('ready', () => {
    logger.info('Redis client is ready')
  })
  redisClient.on('error', (err) => logger.error(`Redis error: ${err}`))
  await redisClient.connect()

  const port = process.env.PORT || 3000
  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`)
}

bootstrap()
