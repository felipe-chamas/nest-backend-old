import { Redis } from 'ioredis'

import getEnv from '../constants/env'

const isTest = getEnv('STAGE') === 'test'

export async function getRedisClient() {
  const host = isTest ? getEnv('REDIS_TEST_HOST') : getEnv('REDIS_IO_HOST')
  const port = isTest ? getEnv('REDIS_TEST_PORT') : getEnv('REDIS_IO_PORT')
  const password = isTest ? getEnv('REDIS_TEST_PASSWORD') : getEnv('REDIS_IO_PASSWORD')

  const redis = new Redis({
    host,
    port: Number(port),
    password
  })

  return redis
}
