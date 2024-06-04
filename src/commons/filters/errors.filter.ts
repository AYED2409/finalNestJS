import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ErrorsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor, contacte con el administrador';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse().toString();
    }
    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
