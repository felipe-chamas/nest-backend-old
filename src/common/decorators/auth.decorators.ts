import { applyDecorators, SetMetadata } from '@nestjs/common'
import { ApiSecurity } from '@nestjs/swagger'

import { Role } from '@common/enums/role.enum'

export const ROLE_KEY = 'role'
export const Auth = (...roles: Role[]) =>
  applyDecorators(SetMetadata(ROLE_KEY, roles), ApiSecurity('X-API-KEY'))
