import 'dotenv/config';
import helmet from 'helmet';
import { NestFactory, Reflector } from '@nestjs/core';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import basicAuth from 'express-basic-auth';

import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter, LoggerInterceptor } from 'common/interceptors';
import { logger, Swagger } from 'common/providers';

import ConnectRedis from 'connect-redis';
import { createClient } from 'redis';
import { AuthGuard } from 'common/guards';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  app.use(helmet());
  app.use(cookieParser());
  app.use(compression());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new LoggerInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalGuards(new AuthGuard(new Reflector()));

  logger.info(config.get<string>('redis_url'));

  const RedisStore = ConnectRedis(session);
  const redisClient = createClient({
    url: config.get<string>('redis_url', 'redis://localhost:6379'),
    legacyMode: true,
  });

  app.set('trust proxy', 1);

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
        sameSite: config.get<string>('stage') === 'local' ? 'strict' : 'none',
      },
    }),
  );

  Swagger.init(app);

  app.use(
    ['/docs', '/docs-json'],
    basicAuth({
      challenge: true,
      users: {
        [config.get<string>('docs.username')]:
          config.get<string>('docs.password'),
      },
    }),
  );

  redisClient.on('ready', () => {
    logger.info('Redis client is ready');
  });
  redisClient.on('error', (err) => logger.error(`Redis error: ${err}`));
  await redisClient.connect();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
