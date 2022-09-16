import { AgreementSession } from '@common/dto/agreement-session.dto'
import { Role } from '@common/enums/role.enum'

declare module 'express-session' {
  interface SessionData {
    agreement?: AgreementSession
    user?: {
      uuid: string
      roles: Role[]
    }
    destroy: (callback?: unknown) => void
  }
}

declare global {
  namespace Express {
    interface User {
      id: string
      displayName?: string
      username?: string
      discriminator?: string
      _json?: {
        realname: string
        avatarfull: string
      }
    }
  }
}
