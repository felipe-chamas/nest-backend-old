import { Controller, Post, Session, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Serialize } from 'common/interceptors';
import { SessionData } from 'express-session';
import { UserDto } from 'models/user/dto';

import { UserService } from 'models/user';

@Controller('auth/fractal')
@Serialize(UserDto)
export class FractalAuthController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard('fractal'))
  @Post('/login')
  async submitAgreement(@Session() session: SessionData) {
    const user = this.userService.findById(session.user.id);
    return user;
  }
}
