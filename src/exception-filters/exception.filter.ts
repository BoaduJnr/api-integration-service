import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { CustomErrorResponse } from './exception.interface';
import { MailService } from 'src/common/mail/mail.service';

@Injectable()
@Catch()
export class ExceptionHandlerFilter implements ExceptionFilter {
  constructor(
    private readonly logger: Logger,
    private mailer: MailService,
  ) {
    this.logger.log(ExceptionHandlerFilter.name);
  }
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.getResponse()['message'] ?? exception.message;
      const errorResponse = this.getErrorResponse(request, message);
      response.status(status).send(errorResponse);
    } else {
      const errorResponse = this.getErrorResponse(request);
      const errorLog = this.getErrorLog(errorResponse, request, exception);
      this.writeErrorLogToFile(errorLog);
      this.mailer.sendMail(
        [process.env.GEORGE_MAIL],
        'Application Server Error',
        `<p>${JSON.stringify(errorLog)}<p>`,
        [{ filename: 'errorLog.log', path: './errorLog.log' }],
      );
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(errorResponse);
    }
  }

  getErrorResponse = (
    request: Request,
    errorMessage?: string,
  ): CustomErrorResponse => ({
    sucess: false,
    message: errorMessage ?? 'Application Server Error',
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
    fs.appendFile('errorLog.log', errorLog, 'utf-8', (err) => {
      if (err) {
        throw err;
      }
    });
  };
}
