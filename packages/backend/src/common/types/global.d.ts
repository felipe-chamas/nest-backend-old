import { AgreementSession } from 'auth/providers/signature/models';
import { Role } from '../enums/role.enum';

declare module 'express-session' {
  interface SessionData {
    agreement?: AgreementSession;
    user?: {
      id: string;
      roles: Role[];
    };
    destroy: (callback?: unknown) => void;
  }
}
