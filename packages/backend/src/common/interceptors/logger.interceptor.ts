import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs';
import { logger } from '../providers/logger';

export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const userAgent = req.get('User-Agent');

    const { method, url, body, params, query, headers, ip } = req;

    logger.log({
      level: 'info',
      message: `${method} ${url}`,
      requestInfo: {
        ip,
        userAgent,
        method,
        url,
        body,
        params,
        query,
        headers,
      },
    });

    return next.handle().pipe(
      map((data) => {
        if (data) {
          const res = context.switchToHttp().getResponse();
          const write = res.write.bind(res);
          const end = res.end.bind(res);

          const regex = /[2-3]0+/;

          const chunk = [];
          const { statusCode } = res;

          res.write = (
            ...data: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>[]
          ) => {
            chunk.push(Buffer.from(data[0]).toString('utf8'));
            write.apply(res, data);
          };

          res.end = (
            ...restArgs: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>[]
          ) => {
            if (restArgs[0]) {
              chunk.push(Buffer.from(restArgs[0]));
            }

            const body = Buffer.concat(chunk).toString('utf8');

            logger.log({
              level: 'info',
              message: `${
                regex.exec(statusCode) !== null
                  ? `${method} ${url} - Response type: Success`
                  : `${method} ${url} - Response type: Error`
              } ${statusCode}`,
              responseData: {
                statusCode,
                body,
              },
            });

            end.apply(res, restArgs);
          };
        }

        return data;
      })
    );
  }
}
