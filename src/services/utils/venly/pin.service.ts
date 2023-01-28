import { randomBytes, pbkdf2Sync } from 'crypto'

import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Redis } from 'ioredis'

import { VenlyService } from '../venly.service'

Injectable()

export class PinService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly config: ConfigService,
    private readonly venlyService: VenlyService
  ) {}

  private async newSalt(uuid: string) {
    const salt = randomBytes(16).toString('hex')
    const userSalt = await this.redis.get(uuid)
    if (userSalt) throw new BadRequestException(`user ${uuid} already have a salt`)
    await this.redis.set(uuid, salt)
    return salt
  }

  private async getSalt(uuid: string): Promise<string> {
    return this.redis.get(uuid)
  }

  /**
   * Calculate user pin
   * @note Don't modify this function!!!
   * @param uuid
   * @param salt
   * @param pepper
   * @returns {string} pin
   */
  private calculatePin(uuid: string, salt: string, pepper: string) {
    return pbkdf2Sync(uuid, salt + pepper, 100000, 32, 'sha512')
      .readUInt32BE()
      .toString()
      .slice(0, 6)
  }

  async getPin(uuid: string) {
    const pepper = this.config.get('pepper')
    const salt = await this.getSalt(uuid)

    const pin = this.calculatePin(uuid, salt, pepper)

    return pin
  }

  async newPin(uuid: string) {
    const salt = await this.newSalt(uuid)
    const pepper = await this.config.get('pepper')
    return this.calculatePin(uuid, salt, pepper)
  }
}
