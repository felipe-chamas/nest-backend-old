import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { UserDto, UserSchema } from '@common/schemas/user.schema'
import { UserController } from '@controllers/user.controller'
import { UserService } from '@services/user.service'

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
    HttpSteamApiModule
  ],
  exports: [UserService],
  providers: [UserService]
})
export class UserModule {}
