import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ValidationError } from '../domain/error/ValidationError';
import { BusinessRuleError } from '../domain/error/BusinessRuleError';
import { NotFoundError } from '../domain/error/NotFoundError';
import { ConflictError } from '../infrastructure/error/ConflictError';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string;
    let code: string;
    let details: any;

    if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = exception.code;
      details = { field: exception.fieldName, value: exception.value };
    } else if (exception instanceof NotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
      code = exception.code;
    } else if (exception instanceof BusinessRuleError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = exception.message;
      code = exception.code;
    } else if (exception instanceof ConflictError) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
      code = exception.code;
      details = { field: exception.fieldName };
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      code = 'UNKNOWN_ERROR';
    }

    const errorResponse = {
      statusCode: status,
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    }

    // 開発環境でのスタックトレース追加
    if (process.env.NODE_ENV === 'development') {
      errorResponse['stack'] =
        exception instanceof Error ? exception.stack : undefined;
    }

    // TODO 以下の実装を完了する。
    // ログレベル別エラーログ出力
    // const logger = new CustomLogger(/* ConfigService */);
    // const errorContext = { path: request.url, code, statusCode: status };

    // if (exception instanceof InfrastructureError || code === 'UNKNOWN_ERROR') {
    //   // FATAL: システム致命的エラー
    //   logger.fatal(message, exception.stack, errorContext);
    // } else if (exception instanceof ApplicationError || exception instanceof DatabaseConstraintError) {
    //   // ERROR: エラー情報、スタックトレース
    //   logger.error(message, exception.stack, errorContext);
    // } else if (exception instanceof DomainError) {
    //   // WARN: 警告情報（ビジネスルール違反）
    //   logger.warn(message, errorContext);
    // } else if (exception instanceof ValidationError || exception instanceof NotFoundError) {
    //   // INFO: アプリケーションイベント（通常の業務フロー）
    //   logger.log(`User input error: ${message}`, errorContext);
    // }

    response.status(status).json(errorResponse);
  }
}
