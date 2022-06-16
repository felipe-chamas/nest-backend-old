import {
  Controller,
  Get,
  Post,
  Body,
  Session,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';

import { AuthService } from '../auth/auth-service';

import { Serialize } from 'common/interceptors';
import { AuthGuard } from 'common/guards';

import { UserDto } from '../dto/user.dto';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { SessionData } from 'express-session';

@Controller('auth')
@Serialize(UserDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Get('/whoami')
  async whoAmI(@Session() session: SessionData) {
    if (!session.user) throw new NotFoundException('No user set in session');

    const id = session.user.id;
    return this.authService.whoAmI(id);
  }

  @Post('/register')
  async create(@Body() createUserDto: CreateUserDto, @Session() session) {
    return `Service to be implemented`;
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() { email, password }: LoginDto, @Session() session) {
    return `Service to be implemented`;
  }

  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Session() session) {
    return `Service to be implemented`;
  }
}
