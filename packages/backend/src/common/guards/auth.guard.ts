import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/auth.decorators';
import { Role } from '../enums/role.enum';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export function isSafeEqual(challenge: string, expected: string): boolean {
  if (!challenge || !expected) return false;

  const hash = crypto.createHash('sha512');
  if (
    crypto.timingSafeEqual(
      hash.copy().update(challenge).digest(),
      hash.copy().update(expected).digest(),
    )
  ) {
    return crypto.timingSafeEqual(
      Buffer.from(challenge),
      Buffer.from(expected),
    );
  } else return false;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private config: ConfigService) {}

  validateApiKey(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const apiKey = request.header('X-API-KEY') || '';
    const expectedApiKey = this.config.get<string>('apiKey');

    return isSafeEqual(apiKey, expectedApiKey);
  }

  validateRoles(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const user = request.session?.user;

    if (!user) {
      return false;
    }

    if (requiredRoles.includes(Role.OWNER) && user.id === request.params.id) {
      return true;
    }

    return requiredRoles.some((role) => user.roles?.includes(role));
  }

  canActivate(context: ExecutionContext): boolean {
    const validationFunctions = [
      () => this.validateApiKey(context),
      () => this.validateRoles(context),
    ];
    return validationFunctions.some((fun) => fun());
  }
}
