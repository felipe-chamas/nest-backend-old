import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

const configService: ConfigService = new ConfigService();

export const RedisClient = createClient({
  url: configService.get<string>('redis.url'),
  legacyMode: true,
});
