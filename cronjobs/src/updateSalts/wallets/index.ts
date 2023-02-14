import { Redis } from 'ioredis'

import getEnv from '../constants/env'
import User from '../models/User'
import slackAlert from '../slack'
import { archiveWallet, createWallet, getNftsCount, getWalletBalance } from '../venly'

export async function handelLostPin(walletId: string, uuid: string, redis: Redis) {
  const nftsCount = await getNftsCount(walletId)
  const balance = await getWalletBalance(walletId)

  if (nftsCount === 0 && balance === 0) {
    console.log('lost pin in empty wallet')

    console.log(`creating new wallet for user ${uuid}`)

    const newWallet = await createWallet(uuid, redis)

    await archiveWallet(walletId)
    console.log(`${walletId} archived`)

    const user = await User.findOne({ uuid })
    user.wallet = newWallet
    await user.save()
    console.log(`new wallet added to user ${uuid}`)
  } else {
    const message = `Lost pin for wallet with balance:\n **wallet id:** ${walletId}\n **uuid:** ${uuid}\n **NFTs count:** ${nftsCount}\n **balance:** ${balance}`
    console.log(message)
    if (getEnv('STAGE') === 'production') {
      await slackAlert(message)
    }
  }
}
