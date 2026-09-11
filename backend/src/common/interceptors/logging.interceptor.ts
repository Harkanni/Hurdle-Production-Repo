import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = request;
    const start = Date.now();

    // Log the incoming request
    this.logger.log(`→ ${method} ${url}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          const logMsg = `← ${method} ${url} [${ms}ms]`;
          // Warn if a request takes longer than 1 second
          if (ms > 1000) {
            this.logger.warn(`SLOW ${logMsg}`);
          } else {
            this.logger.log(logMsg);
          }
        },
        error: () => {
          const ms = Date.now() - start;
          this.logger.error(`✗ ${method} ${url} [${ms}ms]`);
        },
      }),
    );
  }
}
