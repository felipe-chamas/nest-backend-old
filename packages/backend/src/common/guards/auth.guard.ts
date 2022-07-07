import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/auth.decorators';
import { Role } from '../enums/role.enum';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private config: ConfigService) {}

  validateApiKey(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const apiKey = request.header('X-API-KEY') || '';
    const expectedApiKey = this.config.get<string>('apiKey');

    if (!expectedApiKey) return false;

    const hash = crypto.createHash('sha512');
    if (
      crypto.timingSafeEqual(
        hash.copy().update(apiKey).digest(),
        hash.copy().update(expectedApiKey).digest(),
      )
    ) {
      return crypto.timingSafeEqual(
        Buffer.from(apiKey),
        Buffer.from(expectedApiKey),
      );
    } else return false;
  }

  validateRoles(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.session?.user;

    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.role?.includes(role));
  }

  canActivate(context: ExecutionContext): boolean {
    const validationFunctions = [
      () => this.validateApiKey(context),
      () => this.validateRoles(context),
    ];
    return validationFunctions.some((fun) => fun());
  }
}
