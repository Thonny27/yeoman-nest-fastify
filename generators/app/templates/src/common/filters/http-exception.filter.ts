
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Si el mensaje es un objeto, extraer el array de errores si lo hay
    if (typeof message === 'object' && message !== null && 'message' in message) {
      message = (message as any).message;
    }

    response.status(status).send({
      statusCode: status,
      error: exception instanceof HttpException ? exception.name : 'Error',
      message,
      timestamp: new Date().toISOString(),
      path: request?.url || '',
    });
  }
}
