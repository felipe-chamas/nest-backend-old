import 'dotenv/config';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter, LoggerInterceptor } from 'common/interceptors';
import { RedisClient, RedisStore, Swagger } from 'common/providers';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(helmet());
  app.use(cookieParser());
  app.use(compression());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new LoggerInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(
    session({
      secret: config.get<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({ client: RedisClient }),
      cookie: { secure: config.get<string>('env') === 'production' },
    })
  );

  if (config.get<string>('env') === 'development') {
    Swagger.init(app);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
