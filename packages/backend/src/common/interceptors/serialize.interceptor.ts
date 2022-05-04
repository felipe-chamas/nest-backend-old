import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { plainToInstance } from 'class-transformer';

interface ClassConstructor {
  new (...args: any[]): any;
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassConstructor) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    // const serializeOptions = {
    //   groups: ctx.includes('find') ? ['find'] : [],
    //   excludeExtraneousValues: true,
    //   enableImplicitConversion: true,
    // };

    return next.handle().pipe(
      map((data) => {
        const res = plainToInstance(this.dto, data);
        return { ...res, id: data.id };
      })
    );
  }
}
