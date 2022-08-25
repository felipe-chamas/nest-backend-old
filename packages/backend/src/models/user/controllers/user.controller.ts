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
import { Auth } from 'common/decorators/auth.decorators';
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

  @Auth(Role.USER_ADMIN)
  @ApiOperation({ description: 'Deletes a User' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: UserDto })
  @Delete(':id')
  @ApiExcludeEndpoint()
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Auth(Role.USER_ADMIN)
  @ApiOperation({ description: 'Returns a list of Users' })
  @ApiOkResponse({ type: [UserDto] })
  @Get()
  @ApiExcludeEndpoint()
  findAll(@GetPagination() pagination: Pagination) {
    return this.userService.findAll(pagination);
  }

  @Get('whoami')
  @ApiExcludeEndpoint()
  whoAmI(@Session() session: SessionData) {
    if (!session.user) throw new UnauthorizedException();
    const { id } = session.user;
    return this.userService.findById(id);
  }

  @Auth(Role.USER_ADMIN)
  @Get(':id')
  @ApiOperation({ description: 'Returns a User' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: UserDto })
  @ApiExcludeEndpoint()
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Auth(Role.USER_ADMIN, Role.ROLE_ADMIN, Role.OWNER)
  @Patch(':id')
  @ApiOperation({ description: 'Updates a User' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserDto })
  @ApiExcludeEndpoint()
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Session() session: SessionData,
  ) {
    if (!session.user?.roles?.includes(Role.ROLE_ADMIN))
      updateUserDto.roles = [];
    return this.userService.update(id, updateUserDto);
  }
}
