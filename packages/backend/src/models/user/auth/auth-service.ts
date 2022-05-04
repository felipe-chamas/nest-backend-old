import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';

import { promisify } from 'util';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { CreateUserDto } from '../dto/create-user.dto';

import { CurrentUser } from '../decorators/current-user.decorator';

import { User } from 'common/entities';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  async register(createUserDto: CreateUserDto) {
    const users = await this.userService.findByEmail(createUserDto.email);

    if (users.length) {
      throw new BadRequestException('An user with email already exists');
    }

    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(createUserDto.password, salt, 32)) as Buffer;

    const result = salt + '.' + hash.toString('hex');

    return this.userService.create({
      ...createUserDto,
      password: result,
    });
  }

  async login(email: string, password: string) {
    const [user] = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Invalid password');
    }

    return user;
  }

  logout(session?: any) {
    session.userId = null;
    session.destroy();

    return {
      message: 'Logout successful',
    };
  }
}
