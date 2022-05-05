import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { ObjectID } from 'typeorm';
// import { AuthGuard, Serialize, User } from 'common';

import { UserService } from '../services/user.service';

import { UserDto } from '../dto/user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

import { CurrentUser } from '../decorators';
import { Serialize } from 'common/interceptors';

import { AuthGuard } from 'common/guards';
import { User } from 'common/entities';

@Controller('user')
@Serialize(UserDto)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll(@CurrentUser() user: User) {
    if (!user?.isAdmin) throw new UnauthorizedException();

    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: ObjectID) {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: ObjectID, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: ObjectID, @CurrentUser() user: User) {
    if (!user?.isAdmin) throw new UnauthorizedException();

    return this.userService.remove(id);
  }
}
