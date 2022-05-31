import { AgreementSession } from 'auth/providers/signature/models';
import { ObjectID } from 'typeorm';

declare module 'express-session' {
  interface SessionData {
    agreement?: AgreementSession;
    user?: {
      id: ObjectID;
    };
  }
}
