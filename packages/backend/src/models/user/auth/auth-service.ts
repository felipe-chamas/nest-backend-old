import { Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';

import { CurrentUser } from '../decorators/current-user.decorator';

import { User } from 'common/entities';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  async register() {
    return `Service to be implemented`;
  }

  async login() {
    return `Service to be implemented`;
  }

  logout() {
    return `Service to be implemented`;
  }
}
