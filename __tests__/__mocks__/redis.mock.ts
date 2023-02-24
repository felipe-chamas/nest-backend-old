import { Redis } from 'ioredis'

const redisStore = {}

export const mockRedis: Partial<Redis> = {
  get: jest.fn().mockImplementation(async (key: string) => redisStore[key]),
  set: jest.fn().mockImplementation(async (key: string, data: string) => {
    redisStore[key] = data
  })
}
