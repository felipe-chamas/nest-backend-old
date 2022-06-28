import { Controller, Post, Session } from '@nestjs/common';
import { Serialize } from 'common/interceptors';
import { SessionData } from 'express-session';
import { UserDto } from 'models/user/dto';

@Controller('auth')
@Serialize(UserDto)
export class AuthController {
  @Post('/logout')
  async submitAgreement(@Session() session: SessionData) {
    session.destroy();
    return 'OK';
  }
}
