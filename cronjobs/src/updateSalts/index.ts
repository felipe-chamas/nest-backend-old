import { Redis } from 'ioredis'
import mongoose from 'mongoose'

import getEnv from './constants/env'
import User from './models/User'
import { calculatePin, generateNewSalt } from './pin'
import { getRedisClient } from './redis'
import slackAlert from './slack'
import { updatePin } from './venly'
import { handelLostPin } from './wallets'

const mongoUri = getEnv('STAGE') === 'test' ? getEnv('MONGODB_CICD_URI') : getEnv('MONGODB_URI')

async function updateUserPinAndSalt(uuid: string, walletId: string, redis: Redis) {
  const oldSalt = await redis.get(uuid)
  const newSalt = generateNewSalt()

  const oldPin = calculatePin(uuid, oldSalt)
  const newPin = calculatePin(uuid, newSalt)

  function logError(error) {
    console.log(`failed to update user ${uuid} pin, with error:`)
    console.log(error.response.data.errors)
  }

  try {
    await updatePin(oldPin, newPin, walletId)
  } catch (error) {
    logError(error)
    if (
      error.response.data.errors.some(
        (e) => e.code === 'pincode.no-tries-left' || e.code === 'pincode.incorrect'
      )
    ) {
      try {
        await handelLostPin(walletId, uuid, redis)
      } catch (error) {
        const message = `failed to handel lost pint for empty wallet.\n **waller:** ${walletId}\n **error:** ${JSON.stringify(
          error,
          null,
          2
        )}`
        console.log(message)
        if (getEnv('STAGE') === 'production') {
          await slackAlert(message)
        }
      }
    }
    return
  }

  try {
    await redis.set(uuid, newSalt)
  } catch (error) {
    await updatePin(newPin, oldPin, walletId)
    logError(error)
    return
  }
  console.log(`user ${uuid} pin succeeded updated`)
}

export default async function updateSaltsAndPins() {
  console.log('Start Update')

  await mongoose.connect(mongoUri)
  console.log('querying users...')
  const users = await User.find({ wallet: { $ne: null } })

  const redisClient = await getRedisClient()
  console.log(`updating ${users.length} users pins...`)
  await Promise.all(
    users.map((user) => updateUserPinAndSalt(user.uuid, user.wallet.id, redisClient))
  )

  console.log('done!')

  await redisClient.quit()
  await mongoose.disconnect()

  if (getEnv('STAGE') === 'production') {
    await slackAlert('users pin and salts updates process ran')
  }
}
