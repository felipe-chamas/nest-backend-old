import { pbkdf2Sync, randomBytes } from 'crypto'

import getEnv from '../constants/env'

export function generateNewSalt() {
  return randomBytes(16).toString('hex')
}

/**
 * Calculate user pin
 * @note Don't modify this function!!!
 * @param uuid
 * @param salt
 * @returns {string} pin
 */
export function calculatePin(uuid: string, salt: string) {
  const pepper = getEnv('PEPPER')
  return pbkdf2Sync(uuid, salt + pepper, 100000, 32, 'sha512')
    .readUInt32BE()
    .toString()
    .slice(0, 6)
}
