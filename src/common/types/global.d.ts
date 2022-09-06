import { AgreementSession } from '@common/dto/agreement-session.dto'
import { Role } from '@common/enums/role.enum'

declare module 'express-session' {
  interface SessionData {
    agreement?: AgreementSession
    user?: {
      id: string
      roles: Role[]
    }
    destroy: (callback?: unknown) => void
  }
}
