import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomErrorResponse } from './exception.interface';
import * as fs from 'fs';

@Catch()
export class ExceptionHandlerFilter implements ExceptionFilter {
  private logger = new Logger(ExceptionHandlerFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.message;
      const errorResponse = this.getErrorResponse(request, message);
      response.status(status).send(errorResponse);
    } else {
      const errorResponse = this.getErrorResponse(request);
      const errorLog = this.getErrorLog(errorResponse, request, exception);
      this.writeErrorLogToFile(errorLog);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(errorResponse);
    }
  }

  getErrorResponse = (
    request: Request,
    errorMessage?: string,
  ): CustomErrorResponse => ({
    sucess: false,
    message: errorMessage || 'Application Server Error',
    path: request.url,
    timestamp: new Date().toISOString(),
  });
  getErrorLog = (
    errorResponse: CustomErrorResponse,
    request: Request,
    exception: unknown,
  ): string => {
    const { message } = errorResponse;
    const { url, method } = request;

    const errorLog = `Method : ${method} - URL : ${url} \n\n
    ${exception instanceof HttpException ? exception.stack : message}\n\n`;
    this.logger.log(errorLog);
    return errorLog;
  };
  writeErrorLogToFile = (errorLog: string) => {
    fs.appendFile('errorLog', errorLog, 'utf-8', (err) => {
      if (err) {
        throw err;
      }
    });
  };
}
