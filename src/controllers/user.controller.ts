import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Session,
  UnauthorizedException,
  Post,
  NotFoundException
} from '@nestjs/common'
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  PartialType
} from '@nestjs/swagger'
import { SessionData } from 'express-session'

import { Auth } from '@common/decorators/auth.decorators'
import { GetPagination, Pagination } from '@common/decorators/pagination.decorators'
import { WalletBodyDto } from '@common/dto/create-wallet.dto'
import { Role } from '@common/enums/role.enum'
import { UserDto } from '@common/schemas/user.schema'
import { UserService } from '@services/user.service'
import { VenlyService } from '@services/utils/venly.service'

@ApiTags('Users')
@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly venlyService: VenlyService
  ) {}

  @Auth(Role.USER_ADMIN)
  @ApiOperation({ description: 'Returns a list of Users' })
  @ApiOkResponse({ type: [UserDto] })
  @Get()
  @ApiExcludeEndpoint()
  findAll(@GetPagination() pagination: Pagination) {
    return this.userService.findAll(pagination)
  }

  @Auth(Role.USER_ADMIN)
  @ApiOperation({ description: 'Deletes a User' })
  @ApiParam({ name: 'uuid', type: String })
  @ApiOkResponse({ type: UserDto })
  @Delete(':uuid')
  @ApiExcludeEndpoint()
  remove(@Param('uuid') uuid: string) {
    return this.userService.remove(uuid)
  }

  @Get('whoami')
  @ApiExcludeEndpoint()
  whoAmI(@Session() session: SessionData) {
    if (!session.user) throw new UnauthorizedException()
    const { uuid } = session.user
    const user = this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)
    return user
  }

  @Auth(Role.USER_ADMIN, Role.ROLE_ADMIN, Role.OWNER)
  @Patch(':uuid')
  @ApiOperation({ description: 'Updates a User' })
  @ApiParam({ name: 'uuid', type: String })
  @ApiBody({ type: PartialType(UserDto) })
  @ApiOkResponse({ type: UserDto })
  @ApiExcludeEndpoint()
  update(
    @Param('uuid') uuid: string,
    @Body() updateUserDto: Partial<UserDto>,
    @Session() session: SessionData
  ) {
    if (!session.user?.roles?.includes(Role.ROLE_ADMIN)) updateUserDto.roles = []
    const user = this.userService.update(uuid, updateUserDto)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)
    return user
  }

  @Auth(Role.USER_ADMIN)
  @Get(':uuid')
  @ApiOperation({ description: 'Returns a user' })
  @ApiParam({ name: 'uuid', type: String })
  @ApiOkResponse({ type: UserDto })
  async findByUUID(@Param('uuid') uuid: string) {
    const user = await this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)
    return user
  }

  @Auth(Role.USER_ADMIN)
  @Get('steam/:steamId')
  @ApiOperation({ description: 'Returns a user connected with steamId' })
  @ApiParam({ name: 'steamId', type: String })
  @ApiOkResponse({ type: UserDto })
  async findBySteamId(@Param('steamId') steamId: string) {
    const user = await this.userService.findBySteamId(steamId)
    if (!user) throw new NotFoundException(`Can't find user with steamId: ${steamId}`)
    return user
  }

  @Auth(Role.USER_ADMIN)
  @Post('wallet')
  @ApiOperation({ description: 'Creates a wallet for this user' })
  @ApiParam({ name: 'uuid', type: String })
  @ApiOkResponse({ type: UserDto })
  async createWallet(@Body() { uuid, pincode }: WalletBodyDto) {
    const user = await this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)
    const wallet = await this.venlyService.createWallet({ uuid, pincode })
    return this.userService.update(uuid, { wallet })
  }
}
