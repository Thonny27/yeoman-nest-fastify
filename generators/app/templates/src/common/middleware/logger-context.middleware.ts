import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggerContextMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const requestId = randomUUID();
    (req as any).requestId = requestId;

    console.log(`[${requestId}] ${req.method} ${req.url}`);
    next();
  }
}