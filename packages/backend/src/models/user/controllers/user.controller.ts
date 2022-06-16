import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { ObjectID } from 'typeorm';

import { UserService } from '../services/user.service';

import { UserDto } from '../dto/user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

import { Serialize } from 'common/interceptors';

import { AuthGuard } from 'common/guards';
import { GetPagination, Pagination } from 'common/decorators';
import { Roles } from 'common/decorators/roles.decorators';
import { Role } from 'common/enums/role.enum';
import { CurrentUser } from '../decorators';

import { User } from 'common/entities';

@Controller('user')
@Serialize(UserDto)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll(@GetPagination() pagination: Pagination) {
    return this.userService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: ObjectID) {
    return this.userService.findOne({ id });
  }

  @Roles(Role.USER_ADMIN, Role.ROLES_ADMIN)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: ObjectID,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    if (!user.roles.includes(Role.ROLES_ADMIN)) {
      updateUserDto.roles = null;
    }

    return this.userService.update(id, updateUserDto);
  }

  @Roles(Role.USER_ADMIN)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: ObjectID) {
    return this.userService.remove(id);
  }
}
