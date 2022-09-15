import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Session,
  UnauthorizedException,
  Post
} from '@nestjs/common'
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger'
import { SessionData } from 'express-session'

import { Auth } from '@common/decorators/auth.decorators'
import { CreateUserDto } from '@common/dto/create-user.dto'
import { UpdateUserDto } from '@common/dto/update-user.dto'
import { Role } from '@common/enums/role.enum'
import { UserDto } from '@common/schemas/user.schema'
import { UserService } from '@services/user.service'

@ApiTags('Users')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth(Role.USER_ADMIN)
  @ApiOperation({ description: 'Deletes a User' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: UserDto })
  @Delete(':id')
  @ApiExcludeEndpoint()
  remove(@Param('id') id: string) {
    return this.userService.remove(id)
  }

  @Get('whoami')
  @ApiExcludeEndpoint()
  whoAmI(@Session() session: SessionData) {
    if (!session.user) throw new UnauthorizedException()
    const { id } = session.user
    return this.userService.findById(id)
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
    @Session() session: SessionData
  ) {
    if (!session.user?.roles?.includes(Role.ROLE_ADMIN)) updateUserDto.roles = []
    return this.userService.update(id, updateUserDto)
  }

  @Auth(Role.USER_ADMIN)
  @Get(':uuid')
  @ApiOperation({ description: 'Returns a user' })
  @ApiParam({ name: 'uuid', type: String })
  @ApiOkResponse({ type: UserDto })
  async findByUUID(@Param('uuid') uuid: string) {
    const user = await this.userService.findByUUID(uuid)
    return user
  }

  @Post()
  async create(@Body() body: CreateUserDto) {
    const user = await this.userService.create(body)
    return user
  }
}
