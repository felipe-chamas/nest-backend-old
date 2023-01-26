import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { UserDto, UserSchema } from '@common/schemas/user.schema'
import { UserController } from '@controllers/user.controller'
import { UserService } from '@services/user.service'

import { HttpElixirApiModule } from './utils/elixir/api.module'
import { HttpSteamApiModule } from './utils/steam/api.module'
import { VenlyModule } from './utils/venly.module'

@Module({
  controllers: [UserController],
  imports: [
    MongooseModule.forFeature([
      {
        name: UserDto.name,
        schema: UserSchema
      }
    ]),
    VenlyModule,
    HttpSteamApiModule,
    HttpElixirApiModule
  ],
  exports: [UserService],
  providers: [UserService]
})
export class UserModule {}
