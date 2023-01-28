import { Redis } from 'ioredis'
import mongoose from 'mongoose'

import updateSaltsAndPins from '../../src/updateSalts'
import getEnv from '../../src/updateSalts/constants/env'
import User from '../../src/updateSalts/models/User'
import { getRedisClient } from '../../src/updateSalts/redis'
import { usersE2e } from '../mocks/users'

const mockConsole = jest.spyOn(console, 'log')

describe('updateSaltsAndPins (e2e)', () => {
  let redisClient: Redis
  const uuid = usersE2e[0].uuid
  beforeEach(async () => {
    await mongoose.connect(getEnv('MONGODB_CICD_URI'))
    await Promise.all(
      usersE2e.map((user) => {
        const newUser = new User(user)
        return newUser.save()
      })
    )

    redisClient = await getRedisClient()
    const userSalt = await redisClient.get(uuid)
    if (!userSalt) await redisClient.set(uuid, '12345')
  })
  afterAll(async () => {
    await User.deleteMany({})
    await mongoose.disconnect()
  })
  it('only get users with wallet and updated successfully', async () => {
    const initialSalt = await redisClient.get(uuid)
    await updateSaltsAndPins()
    expect(mockConsole.mock.calls[1][0]).toEqual(`updating 1 users pins...`)

    const lastSalt = await redisClient.get(uuid)
    expect(lastSalt).not.toEqual(initialSalt)

    expect(mockConsole.mock.calls[2][0]).toEqual(`user ${uuid} pin succeeded updated`)
  })
})
