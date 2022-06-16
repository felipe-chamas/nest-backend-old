import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Session,
} from '@nestjs/common';

import { ObjectID } from 'typeorm';

import { UserService } from '../services/user.service';

import { UserDto } from '../dto/user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

import { Serialize } from 'common/interceptors';

import { GetPagination, Pagination } from 'common/decorators';
import { Roles } from 'common/decorators/roles.decorators';
import { Role } from 'common/enums/role.enum';
import { SessionData } from 'express-session';

@Controller('user')
@Serialize(UserDto)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@GetPagination() pagination: Pagination) {
    return this.userService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: ObjectID) {
    return this.userService.findOne({ id });
  }

  @Roles(Role.USER_ADMIN, Role.ROLES_ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: ObjectID,
    @Body() updateUserDto: UpdateUserDto,
    @Session() session: SessionData,
  ) {
    if (!session.user.roles.includes(Role.ROLES_ADMIN))
      updateUserDto.roles = [];
    return this.userService.update(id, updateUserDto);
  }

  @Roles(Role.USER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: ObjectID) {
    return this.userService.remove(id);
  }
}
