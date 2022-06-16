import { Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';

import { ObjectID } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  whoAmI(id: ObjectID) {
    return this.userService.findById(id);
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
