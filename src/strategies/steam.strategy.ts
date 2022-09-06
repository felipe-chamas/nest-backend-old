import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-steam'

import { SteamService } from '@services/auth/steam.service'

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor(private readonly steamService: SteamService, private readonly config: ConfigService) {
    super({
      returnURL: config.get<string>('steam.returnURL'),
      realm: config.get<string>('steam.realm'),
      apiKey: config.get<string>('steam.apiKey')
    })
  }

  async validate(identifier, profile, done) {
    profile.identifier = identifier
    return done(null, profile)
  }
}
