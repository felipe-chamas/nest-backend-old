import connectRedis from 'connect-redis';
import session from 'express-session';

export const RedisStore = connectRedis(session);
