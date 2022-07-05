import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Session,
  UnauthorizedException,
} from '@nestjs/common';

import { UserService } from '../services/user.service';

import { UserDto } from '../dto/user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

import { Serialize } from 'common/interceptors';

import { GetPagination, Pagination } from 'common/decorators';
import { Roles } from 'common/decorators/roles.decorators';
import { Role } from 'common/enums/role.enum';
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SessionData } from 'express-session';

@ApiTags('Users')
@Controller('user')
@Serialize(UserDto)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.USER_ADMIN)
  @ApiOperation({ description: 'Deletes a User' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserDto })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Roles(Role.USER_ADMIN)
  @ApiOperation({ description: 'Returns a list of Users' })
  @ApiOkResponse({ type: [UserDto] })
  @Get()
  findAll(@GetPagination() pagination: Pagination) {
    return this.userService.findAll(pagination);
  }

  @Roles(Role.USER_ADMIN)
  @Get(':id')
  @ApiOperation({ description: 'Returns a User' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: UserDto })
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get('whoami')
  @ApiExcludeEndpoint()
  whoAmI(@Session() session: SessionData) {
    if (!session.user) throw new UnauthorizedException();
    const { id } = session.user;
    return this.userService.findById(id);
  }

  @Roles(Role.USER_ADMIN, Role.ROLES_ADMIN)
  @Patch(':id')
  @ApiOperation({ description: 'Updates a User' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserDto })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Session() session: SessionData,
  ) {
    if (!session.user?.roles.includes(Role.ROLES_ADMIN))
      updateUserDto.roles = [];
    return this.userService.update(id, updateUserDto);
  }
}
