import { ethers } from 'ethers'

export const MAX_WAIT_FOR_SIGNED_AGREEMENT = 1000 * 60 * 10 // 10 minutes in milliseconds

export const MAX_INT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

export const HASH_ZERO = ethers.constants.HashZero

export const SBT_COUNTER_INCREMENT_HASH = ethers.utils
  .solidityKeccak256(['string'], ['increment(bytes)'])
  .substring(0, 10)
