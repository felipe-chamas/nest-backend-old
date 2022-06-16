import { AgreementSession } from 'auth/providers/signature/models';
import { Role } from '../enums/role.enum';
import { ObjectID } from 'typeorm';

declare module 'express-session' {
  interface SessionData {
    agreement?: AgreementSession;
    user?: {
      id: ObjectID;
      roles: Role[];
    };
  }
}
