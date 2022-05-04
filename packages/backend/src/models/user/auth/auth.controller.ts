import {
  Controller,
  Get,
  Post,
  Body,
  Session,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from '../auth/auth-service';

import { Serialize } from 'common/interceptors';
import { AuthGuard } from 'common/guards';

import { UserDto } from '../dto/user.dto';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../dto/create-user.dto';

import { User } from '../../../common/entities/user.entity';
import { CurrentUser } from '../decorators';

@Controller('auth')
@Serialize(UserDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Get('/whoami')
  async whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Post('/register')
  async create(@Body() createUserDto: CreateUserDto, @Session() session) {
    const user = await this.authService.register(createUserDto);

    session.userId = user.id;

    return user;
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() { email, password }: LoginDto, @Session() session) {
    const user = await this.authService.login(email, password);

    session.userId = user.id;

    return user;
  }

  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Session() session) {
    return this.authService.logout(session);
  }
}
