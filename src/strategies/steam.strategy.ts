import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Profile } from 'passport'
import { VerifiedCallback } from 'passport-custom'
import { Strategy } from 'passport-steam'

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor(private readonly config: ConfigService) {
    super({
      returnURL: config.get<string>('steam.returnURL'),
      realm: config.get<string>('steam.realm'),
      apiKey: config.get<string>('steam.apiKey')
    })
  }

  async validate(_identifier: string, profile: Profile, done: VerifiedCallback) {
    return done(null, profile)
  }
}
