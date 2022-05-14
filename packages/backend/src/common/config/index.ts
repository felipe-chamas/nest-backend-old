export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.MONGO_CONN_STRING,
    dbName: process.env.DB_NAME,
    userName: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  sqs: {
    queueUrl: process.env.EVENTS_QUEUE_URL,
  },
  blockchain: {
    jsonRpcProvider: process.env.JSON_RPC_PROVIDER,
  },
  throttler: {
    ttl: process.env.THROTTLER_TTL || '1m',
    limit: process.env.THROTTLER_LIMIT || '10/1m',
    throttler: process.env.THROTTLER_MAX || '100/1m',
  },
  session_secret: process.env.SESSION_SECRET || 'secret',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
});
